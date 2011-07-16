var smart = require('sk/core/smart').smart;

//throws queues into a database. This is ideal for systems
//that want to load balance requests, AND recover from any particular crashes IF they ever happen 
var DBQueue = function(database,ops)
{                                              
	//is mongoose
	if(database.collection)
	{
		var Model = database;
		database = database.collection;
	}
	
	var callback;

	if(typeof ops == 'function')
	{
		callback = ops;  
		ops = {};
	}
	else
	{
		callback = ops.callback;   
	}

	var timeout    = ops.timeout || 1000*10,
	size    	   = ops.size || 10,
	lockDuration   = ops.lockDuration || 3600*1000,
	searchCallback = ops.search,
	slave		   = ops.slave == undefined ? true : ops.slave,
	previousN      = 0,
	lockProperty   = ops.lockProperty || 'lockedUntil';   
	                 
	database.ensureIndex([[lockProperty,'1']],false,function(){});
	                        
	
	function valueOrFunc(value)
	{
		return (typeof value == 'function') ? value() : value;
	}

	function getMaxSize()
	{
		return valueOrFunc(size);
	}

	function getTimeoutInterval()
	{
		return valueOrFunc(timeout)
	}


	function messageCallback(n)
	{
		if(n == previousN) return;
		previousN = n;
		if(ops.message) return ops.message(n);
		console.verbose(+n+' items in database queue');
	}


	this.add = function(search,data,callback)
	{
		if(!data || (typeof data == 'function'))
		{
			callback = data;
			data = search;
			search = undefined;
		}

		var s = this;

		function done(err,result)
		{
			if(callback) callback(err,result);
		}

		if(search)
		{
			database.findOne(search,function(err,result)
			{
				
				if(data.$set || data.$addToSet)
				{
					if(!data.$set) data.$set = {};
					if(!data[lockProperty]) data.$set[lockProperty] = new Date();
					database.update(search,data,{upsert:true},done)
				}
				else
				if(result)
				{
					database.update(search,{$set:data},done);
				}
				else
				{
					//copy it.
					for(var i in search) data[i] = search[i];
					s.add(data,callback);
				}
			});

		}
		else
		{
			if(!data[lockProperty]) data[lockProperty] = new Date();
			database.insert(data,done);
		}

	}

	var locked = false, numRunning = 0,currentTimeout;

	//now is executed once
	function timeoutForNextBatch(now)
	{               
		if(!slave) return;
		
		currentTimeout = smart.timeout(onNextBatchTimeout,getTimeoutInterval());
		if(now) nextCueBatch();
	}

	function onNextBatchTimeout()
	{
		//we need to CONSTANTLY run a timeout since the size can change dynamically, along with the
		//timeout interval
		timeoutForNextBatch();
		nextCueBatch();
	}
	
	this.dispose = function()
	{
		console.verbose('dispose queue')
		if(currentTimeout) currentTimeout.stop();
	}

	function nextCueBatch()
	{   
		if(!slave) return;
		

		//1. if we're still locked, then neither updating, or running have been set, so we need to stop
		//2. if the number of items running exceeds the max size, then we need to stop.
		if(numRunning >= getMaxSize())
		{	
			console.notice(database.name+" is locked since "+numRunning+' items are updating.');
			return;
		}
		else
		if(locked)
		{
			console.notice(database.name+" is locked, since it hasn't finished updating the items currently used.");
			return;
		}

		locked = true;  
		var search = {};
		search[lockProperty] = {$lt:new Date()}; 
                          

		//tack on additional search parameters if need be
		if(searchCallback) searchCallback(search);


		function init()
		{
			
			function onStack(stack)
			{                    
				if(!stack.length) 
				{
					locked = false;
					return;
				}    
				if(stack.length + numRunning > size)
				{
					console.error('the queue stack exceeds the maximum size: '+size+'. '+(stack.length+numRunning)+' items are now being executed (Yes this is a bug >.>).');
				}



				var searchIds = [];

				for(var i = stack.length; i--;)
				{                                      
					searchIds.push(stack[i]._id);
				}                          
				
				var updateLocked = {};    
				updateLocked[lockProperty] = new Date(new Date().getTime()+lockDuration); 
				
				//update ALL of them
				database.update({_id:{$in:searchIds}},{$set:updateLocked,$inc:{lockCount:1}},{multi:true},function(err,result)
				{
					numRunning += stack.length;
					locked = false;

					stack.forEach(function(item)
					{
						var nx = 
						{
							next:function()
							{
								--numRunning;

								//yes, we're checking TWICE to make sure we're not running the cue again when it's not done, because
								//we don't want the notice to pester us. the notice is in place to check whether things are running smoothly
								//over a duration of time, and that no requests are stopping the gravy train.
								if(!locked && numRunning < size) nextCueBatch();

							}
							,remove:function()
							{
								database.remove({_id:item._id},function()
								{
									nx.next();
								});
							}
							,update:function(lockedUntilOrUpdate)
							{                         
								var update = {};
								 
								if(lockedUntilOrUpdate instanceof Date)
								{
									update[lockProperty] = lockedUntilOrUpdate;
								}
								else    
								if(typeof lockedUntilOrUpdate == 'object')
								{
									update = lockedUntilOrUpdate;
								}  
								else
								{
									update[lockProperty] = lockedUntilOrUpdate; 
								}                              
                                                      

								database.update({_id:item._id},{$set:update},function()
								{
									nx.next();
								})
							}
						}	
						callback(item,nx);
					});
				});
			}
			
			//if mongoose is present, then use it
			if(Model)
			{
				Model.find(search).limit(size-numRunning).find(function(err, stack)
				{
					onStack(stack || []);
				})
			}
            else
            {
				database.find(search,{limit:size-numRunning},function(err,cursor)
				{                           
					cursor.toArray(function(err,stack)
					{
						onStack(stack);
					})
				})
			}
			

		}

		//parts of the queue we can parse NOW
		database.count(search, function (err, n)
		{
			locked = n > 0;                                   
			messageCallback(n);
			init();
		});


	}

	this.next = nextCueBatch;

	//only initialize the cue batch if we're not locked. This only happens if we're a slave
	if(!locked && slave)
	{                                     
		var update = {};
		update[lockProperty] = new Date();    
		var nonLockedUntil = {};
		nonLockedUntil[lockProperty] = undefined;
		
		//update any items that aren't locked. this typically only occurs when I update the code, and the "lockUntil" param is undefined
		database.update(nonLockedUntil,{$set:update},{multi:true},function(err,n)
		{   
			timeoutForNextBatch(true);     
		});  
	}
}



var SharedDBQueueHandler = function(name,queue,ops)
{
	var callback;
	
	this.name = name;
	this.queue = queue;
	
	if(typeof ops == 'function')
	{
		callback = ops;
		ops = {};
	}
	else
	{
		callback = ops.callback;
	}
	
	
	this.add = function(search,data)
	{
		if(!data)
		{
			data = search;
			search = {};
		}
		
		
		//tack the data under the name of this shared queue
		var toAdd = {};
		
		//add the queue to the shared queue
		queue.add(search,{_queue:name,data:data});
	}
	
	
	this.callback = function(data,callback)
	{
		callback(data,callback);
	}
	
	this.addSearch = function(search)
	{
		if(ops.search) ops.search(search);
	}
}


var SharedDBQueue = function(database,ops,callback)
{
	
	//all of the handlers sharing this database
	var handlersByName = {},
		handlers = [],
		currentHandlerIndex = 0,
		MIN_DURATION = 10000,
		MAX_QUEUE_SIZE = 10;
	
	this.addHandler = function(name,ops)
	{
		if(handlersByName[name])  throw new Exception('The database queue handler '+name+' already exists.');
		
		var handler = handlersByName[name] = new SharedDBQueueHandler(name,this,ops);
		handlers.push(handler);
	}
	
	
	var ops = 
	{
		message:function(n)
		{
			
		}
		,size:function()
		{
			return handlers.length*MAX_QUEUE_SIZE;
		}
		,search:function(search)
		{
			
			if(!handlers.length) return;
			
			var handler = handlers[currentHandlerIndex];
			
			
			currentHandlerIndex++;
			currentHandlerIndex %= handlers.length;
			
			
			//round robin.
			
			//don't do this stupid shit. $or is REALLY taxing. 
			var $or = search.$or = search.$or || [];
			
			for(var i in handlers)
			{
				var handler = handlers[i];
				
				$or.push({_queue:handler.name});
				
				//the handler might have additional items to tack on
				handler.search(search);
				
			}
		}
		,timeout:function()
		{
			return Math.round(MIN_DURATION/Math.min(handlers.length,1));
		}
		,callback:function(item,callback)
		{
			var handler = handlersByName[item._queue];
			handler.callback(item,callback);
		}
	}
	
	//a regular database queue
	var dbQueue = new DBQueue(database,ops);
}


exports.DBQueue     = DBQueue;