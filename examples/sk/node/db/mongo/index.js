
var mongodb = require('mongodb');


    MongoDb = mongodb.Db,
    MongoServer = mongodb.Server,
    MongoConnection = mongodb.Connection,
    Collection = mongodb.Collection,
    Queue = require('../../../core/queue').Queue,
    BSON = mongodb.BSONPure;


var MongoCollection = function(mongo,name,skipQueue)
{
	var q = mongo.queue,
	collection,
	s = this,
	cQ = new Queue();
	this.name = name;
	this.fast = {};
	
	/*this.findOne = function(search,callback)
	{
	collection.find(search,{limit:1},callback); 
	}*/
	
	function copyFunc(i,skip)
	{      
		if(skip || (skipQueue && skipQueue.indexOf(i) > -1))
		{    
			return function()
			{                     
				collection[i].apply(collection,arguments);
			}
		}    
		
		                   
		return function()
		{                              

			//args is not an array??? wtf??
			var args = arguments;       
			var skip = q.stack.length == 0; 
			var callback = args[args.length-1];   
			
			args[args.length-1] = function()
			{
				callback.apply(null,arguments);
				if(!skip) cQ.next();       
			} 
			

			cQ.add(function()
			{           
				collection[i].apply(collection,args);   
				
				if(skip) cQ.next();                
			});
		}
	}
	for(var i in Collection.prototype)
	{
		s[i] = copyFunc(i);
		s.fast[i] = copyFunc(i,true)
	}

	//select the database
	q.add(function()
	{
		var col = mongo.db.collection(name,function(err,col)
		{
			if(err)
			console.error(err.message)    
			collection = col;
			
			//let the collection loose
			cQ.start();
			q.next();
		});
	})    
}


var Mongo = function(database)
{
	var q    = this.queue = new Queue(true);
	var s    = this;
	var host = process.env['MONGO_NODE_DRIVER_HOST'] || '127.0.0.1';
	var port = process.env['MONGO_NODE_DRIVER_PORT'] || MongoConnection.DEFAULT_PORT;
	var con  = this.con = new MongoDb(database,new MongoServer(host,port,{}),{});
	var collections = {};
	this.name = database;

	//connect to the database
	q.add(function()
	{
		con.open(function(err,db)
		{
			if(err)
			{
				return q.clear();
			}
			s.db = db;

			q.next();
		});
	});
	
	this.dropDatabase = function(callback)
	{
		con.dropDatabase(callback)
	}
	
	this.collection = function(name,skipQueue)
	{
		return collections[name] || (collections[name] = new MongoCollection(s,name,skipQueue)); 
	}

	this.collectionNames = function(callback)
	{
		con.collectionNames(callback);
	}
}

//used because the ID of each mongo object is a reference
function stringify(tg)
{
  if(tg && tg.id)
  {
    return String(tg);
  }
  else
  if(tg instanceof String)
  {
    return tg;
  }
  else
  if(tg instanceof Array)
  {
    var stack = [];
    tg.forEach(function(item)
    {
      stack.push(stringify(item));
    });
    return stack;
  }
  else
  if(tg instanceof Date)
  {
    return tg.getTime();
  }else
  if(tg instanceof Object)
  {
    var c = {};
    for(var i in tg)
    {
      c[i] = stringify(tg[i]);
    }
    return c;
  }
  else
  {
    return tg;
  }
}


exports.Mongo = Mongo;
exports.stringify = stringify;
exports.ObjectID = BSON.ObjectID;
exports.objectId = function(str)
{
	try
	{
		return BSON.ObjectID.createFromHexString(String(str));
	}catch(e)
	{
		console.error(e.toString().red)
	}
}
