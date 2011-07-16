var Worker = require('./ww').Worker,
	sys = require('sys'),
	exec = require('child_process').exec,
	events = require('events'),
	Structr = require('../../core/struct').Structr,
	EventEmitter = events.EventEmitter,
	loadedControllers = {};
	

//commented out for the slug
//require('./defaultController');
//require('./web_worker');
//require('./ww/webworker-child.js');




//fuck the idea of literring webworkers in my fucking temporary directory.
//what stupid fucking shit is that? I have to resort to this stupid shit now >.>
/*exec('rm -rf /tmp/node-webworker*', function()
{
	 
});*/

var oldExit = process.exit;
/*process.exit = function()
{
	exec('rm -rf /tmp/node-webworker-' + process.pid, function()
	{
		oldExit();
	});
}*/

var LoadWorker = Structr({
	
	'__construct': function()
	{
		this.spawn();
	},
	//loads controllers for the worker
	'loadSource': function (source) 
	{
		this._source = source;
		 this.post({ loadSource: source });
	},
	
	'spawn': function(sources) 
	{
		var self = this;
		
		(sources || []).forEach(function (source)
		{
			self.loadSource(source);
		})
		
	},
	
	//posts a message to the worker
	'abstract post': function (message) { },
	
	//terminates the worker
	'abstract terminate': function () { }
})

var WebLoadWorker = LoadWorker.extend({
	'post': function (message)
	{
		this._worker.postMessage(message);
	},
	'override spawn': function()
	{
		var w = this._worker = new Worker(__dirname + '/web_worker.js'),
			self = this;
		
		w.onmessage = function(m)
		{
			if(self.onResponse) self.onResponse(m.data);
		}
		
		w.onerror = function(e)
		{
			if(self.onError) self.onError(e);
		}
		
		this._super();
	},
	'terminate': function ()
	{
		try
		{
			this._worker.terminate(1);
		}
		catch(e)
		{
			console.error(e);
		}
	}
})
  

function getController(source)
{
	if(loadedControllers[source]) return loadedControllers[source];
	
	var controller = require(source).controller;
	return controller;
}


var WorkerController = function(worker)
{
	
	//true if this worker shouldn't be used anymore 
	var terminated = false,
	
		//emits data on response
		emitter = new EventEmitter(),
		
		//the jobs that are currently running
		pendingJobs = {},
		
		//the interval used to terminate this worker
		terminateInterval,
		
		//the number of jobs currently running
		numJobs = 0,
		
		self = this,
		
		loadedSources = [];
	
	this.numJobs = function()
	{
		return numJobs;
	}
	
	//if there's an error, then let's decrement the jobs. 
	worker.onError = function(e)
	{
		if(self.onError) self.onError(e);
		
		console.error("----------------------------------------");
		console.error("web worker error for %s", worker._source);
		console.error("----------------------------------------");
		console.error(e.stack);
		console.error("----------------------------------------");

		decJobs();
	};
	
	worker.onResponse = function(data)
	{
		//the worker will ping the head to make sure it's not headless.
		for(var action in data)
		{
			if(action == 'ping') 
			{
				return worker.post({ pong: 'pong!' });
			}
            
            emitter.emit(action, data[action]);
		}
		
		//if(!data.uid) throw new Error('A UID is expected when running jobs.');
		
		if(!pendingJobs[data.uid])
		{
			return;
		}
		//respond to the listeners
		emitter.emit(data.uid, data.data);
		
		//decrement the jobs, 
		decJobs();
	}
	
	function post(message, callback)
	{
		numJobs++;
		
		
		//if the terminate interval is set, then we want to remove it
		if(terminateInterval)
		{
			clearTimeout(terminateInterval);
			terminateInterval = undefined;
		}
		
		//setup a UID for the web worker so we can figure out what callba
		message.uid = message.uid || String(new Date().getTime() + Math.random());
		
		//keep track of this job so we can emit the change later
		pendingJobs[message.uid] = 1;
		
		function onResponse(data)
		{
			//delete the pending job
			delete pendingJobs[message.uid];
			emitter.removeListener(message.uid,onResponse);
			
			callback(data);
		}
		
		emitter.addListener(message.uid,onResponse)
		
		//post the message
		worker.post(message);
	}
	
	this.terminated = function()
	{
		return terminated;
	}
	
	this.terminate = function()
	{
		terminated = true;
		worker.terminate();
	}
    
    this.on = function(type, callback)
    {
        emitter.addListener(type, callback);
        
        return {
            dispose: function()
            {
                emitter.removeListener(type, callback);
            }
        };
    }
	
	this.loadSource = function(source)
	{
		if(loadedSources.indexOf(source) > -1) return;
		
		registerController(source);
		
		worker.loadSource(source);
	}
	
	
	function registerController(source)
	{
		var controller = getController(source);
		
		loadedSources.push(source);
		
		for(var i in controller)
		{
			registerSelfCommand(i,controller);
		}
	}
	
	function registerSelfCommand(name)
	{
		if(self[name]) console.error(name+' already exists...');
		
		
		self[name] = function(data, callback)
		{
			if(!callback && (typeof data == 'function'))
			{
				callback = data;
				data = true;
			}
			var msg = {};
			msg[name] = data || true;
			post(msg, callback || function(){});
			return self;
		}
	}
	
	this.keepAlive = function(respawnCallback)
	{
		var pinging = false,
			pingInterval;

		function pingWorker()
		{
			if(terminated) return;
			
			if(pinging)
			{
				console.error('Looks like the worker isn\'t responding. Maybe it crashed... Respawning.');
				respawnCallback();
				return self.terminate();
			}

			pinging = true;

			self.ping(function()
			{
				console.verbose('worker is still alive.');
				pinging = false;
			});

			setTimeout(pingWorker, 5000);
		}

		pingWorker();
	}
	
	function decJobs()
	{
		
		//if there are no more jobs, then get ready to dispose this worker
		if(!(--numJobs))
		{
			
			//if there are any pending jobs, then we want to respond to them with 
			//an error message
			for(var i in pendingJobs)
			{
				emitter.emit(i, { error: true, message: 'unable to fullfull job. this is a bug >.>' });
			}
			
			terminateInterval = setTimeout(function()
			{
				self.terminate();
			},10000);
		}
	}
	
	this.loadSource(__dirname + '/defaultController.js');
}



var Load = new (function()
{
	//controls individual jobs
	var managers = {},
		
	//the worker types. could be child process, web worker, etc.
		workerFactories = {},
		
		workers = {},
		
		maxJobs    = 10,
		
		self = this,
		
		balancers = {};
	
	
	function getWorkerProxy(source, type, retController, workerFactory)
	{
		if(!type) type = 'web';
		
		var controller = getController(source);
		
		var balancer = {};
        
        controller = Structr.copy(controller,{keepAlive:1,terminate:1,on:1});
		
		for(var cmd in controller)
		{
			setBalancingAction(source, type, balancer, cmd, workerFactory);
		}
		
		
		return balancer;
	}
	
	//returns a new load balancer
	this.balancer = function(source, type, retController)
	{
		if(balancers[source]) return balancers[source];
		
		return balancers[source] = getWorkerProxy(source, type, retController, getLeastBusyWorker);
	}
	
	this.worker = function(source, type, retController)
	{
		if(!type) type = 'web';
		
		var worker = getNewWorker(type);
		
		return getWorkerProxy(source, type, retController, function()
		{
			return worker;
		});
	}
	
	function setBalancingAction(source, type, target, action, workerFactory)
	{
		target[action] = function(data, callback)
		{
			//get the least busy worker
			var worker = workerFactory(type);
			
			//load the source for the worker. If the source is already loaded, this will be ignored
			worker.loadSource(source);
			
			//get the action loaded into the worker
			var act = worker[action];
			
			//invoke
			return act(data, callback);
			
		}
	}
	
	function getWorkerFactory(type)
	{
		var workerFactory      = workerFactories[type];
	
		//if the worker doesn't exist, then let's throw the exception
		if(!workerFactory) throw new Error('Workable '+type+' does not exist');
		
		return workerFactory;
	}
	
	function getNewWorker(type)
	{
		var workerFactory      = getWorkerFactory(type);
		return new WorkerController(workerFactory.getNewWorker());
	}
	
	//returns the least busy worker of the given type
	function getLeastBusyWorker(type)
	{
		
		var workerFactory      = getWorkerFactory(type);
		
		//grab the collection of running workers for the given type
		var runningWorkers = workers[type] || (workers[type] = []),
			leastBusy;
		
		
		//run through running workers and find the LEAST busy worker. This is sort of a round-robin
		//approach
		for(var i = runningWorkers.length; i--;)
		{
			var worker = runningWorkers[i];
			
			//if theleast busy doesn't worker, or the new worker is less busy than the 
			//current, then set the least busy.
			if(!worker.terminated() && (!leastBusy || leastBusy.numJobs() > worker.numJobs()))
			{
				leastBusy = worker;
			}
		}
		
		//if the least busy doesn't exist (no running), or the least busy has more jobs then the max, AND the number of running workers
		//doesn't exceed the max, then create a new worker
		if(!leastBusy || (leastBusy.numJobs() > workerFactory.maxJobs && runningWorkers.length < workerFactory.maxWorkers))
		{
			runningWorkers.push(leastBusy = new WorkerController(workerFactory.getNewWorker()));
		}
		
		//OTHERWISE return the least busy worker, even if it's exceeded the max number of jobs.
		return leastBusy;
	}
	
	this.addWorkerFactory = function(factory,type)
	{
		workerFactories[type] = factory; 
	}
});


Load.addWorkerFactory({
	maxWorkers: 4,
	maxJobs: 10,
	getNewWorker: function ()
	{
		return new WebLoadWorker();
	}
},'web');


exports.Load = Load;