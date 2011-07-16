var SKClass = require('../../../core/struct').struct,
	Janitor = require('../../../core/garbage').Janitor,
	net = require('../../io/net'),
	loadRequest = net.loadRequest,
	URLRequest = net.Request,
	EventEmitter = require('../../../core/events').EventEmitter
	getHostName = require('../../server/hostname').get,
	Proxy = require('../../../core/pubsub').Proxy,
	express = require('express');



var ClientRequestor = EventEmitter.extend({
	'override __construct': function(server)
	{
		this._super();
		
		this._server = server;
	},
	'explicit client': {
		set: function(value)
		{
			if(typeof value == 'string')
			{
				var clientParts = value.split(':'),
				clientHost = clientParts[0],
				clientPort = Number(clientParts[1]);
				
				value = { hostname: clientHost, port: clientPort };
			}
			
			this._value = value;
			
			this._server = 'http://' + value.hostname + ':' + value.port;
		}
	},
	'_get': function(uri, data, callback)
	{
		this._request(uri, 'GET', data, callback);
	},
	'_post': function(uri, data, callback)
	{
		this._request(uri, 'POST', data, callback);
	},
	'_request': function(uri, method, data, callback)
	{
		if(!callback && (typeof data != 'object'))
		{
			callback = data;
			data = {};
		}

		var req = new URLRequest(this._server + '/' + uri),
			buffer = '';
			
		req.data = data;
		req.method = method;
		 
		loadRequest(req, function(data)
		{
			try
			{
				callback(JSON.parse(data));
			}
			catch(e)
			{
				console.error(e.stack)
			}
		});
			
	}
})

var SiblingConnection = ClientRequestor.extend({
	'override __construct': function(sibling, mediator, hook)
	{
		this._super();
		this.client(sibling);
		
		this._hook = hook;
		this.port = this.client().port;
		this.hostname = this.client().hostname;
		
		var janitor = this._janitor = new Janitor(),
			self = this;
		
		this.request('availableCalls', function(calls)
		{
			calls.forEach(function(call)
			{
				if(call == 'availableCalls') return;
				
				janitor.addDisposable(mediator.onRequest(call, function(data, callback)
				{
					if(hook.locked.indexOf(call) == -1)
					{
						self.request(call, data, callback);
					}else
					{
						if(!callback && (typeof data == 'function'))
						{
							callback = data;
						}
						
						//we still need to send a response if there is a call, but notifify the hook
						//that this sibling is locked.
						callback(null, true);
					}
				}));
			});
			
			self.emit('connect');
		});
		
		//occassionally check to make sure the hook is up. If not, dispose of it.
		var upInterval = setInterval(function()
		{
			self.up(function(yes)
			{
				if(!yes)
				{
					hook.removeSibling(self);
				}
			});
			
		}, 20000);
		
		janitor.addDisposable({
			dispose: function()
			{
				clearInterval(upInterval);
			}
		})
	},
	'dispose': function()
	{
		this._janitor.dispose();
	},
	'connect': function(callback)
	{
		this._get('connect', { hostname: this._hook.hostname() }, callback);
	},
	'getSiblings': function(callback)
	{
		this._get('siblings', callback);
	},
	'ready': function(sibling, callback)
	{
		this._get('sibling/ready', sibling, callback || function(){});
	},
	'addSibling': function(sibling, callback)
	{
		this._get('add/sibling', sibling, callback || function(){})
	},
	'up': function(callback)
	{
		this._get('up', function(result)
		{
			callback(!!result);
		});
	},
	'request': function(name, data, callback)
	{
		if(!callback && (typeof data == 'function'))
		{
			callback = data;
			data = undefined;
		}

		var self = this;


		self._post('request', { name: name, data: JSON.stringify(data) }, function(data)
		{
			(data ? data.responses : []).forEach(function(response)
			{
				callback(response);
			})
		})

	},
	'toJSON': function()
	{
		return this.client();
	},
	'toString': function()
	{
		return this.hostname+':'+this.port;
	}
});


function getClientKey(client)
{
	return typeof client == 'object' ? client.hostname+':'+client.port : client;
}


var Hook = EventEmitter.extend({
	'override __construct': function(mediator)
	{
		this._super();
		
		this._mediator = mediator || new Proxy();
		this._siblingsAr = [];
		this._siblingsObj = {};
		
		//locked calls incomming from hook
		this.locked = [];
		
		var self = this;
	},
	
	'explicit hostname':1,
	
	//the client for this hook - hostname + port
	'explicit client':1,
	
	//returns the next sibling - for round robin, or single requests (workers)
	'nextSibling': function()
	{
		if(!this._siblingsAr.length) return null;
		
		var sib = this._siblingsAr.pop();
		this._siblingsAr.unshift(sib);
		return sib;
	},
	
	//adds a sibling
	'addSibling': function(sibling)
	{
		var key = getClientKey(sibling);
		
		if(this._siblingsObj[key]) return;
		
		var sib = this._siblingsObj[key] = new SiblingConnection(sibling, this._mediator, this),
		self = this,
		connectListener = sib.addListener('connect', function()
		{
			connectListener.dispose();
			self.emit('siblingConnect');
		});
		
		console.ok('connecting to sibling: %s', sib.toString());
		
		this._siblingsAr.push(sib);
	},
	
	//removes a sibling 
	'removeSibling': function(sibling)
	{
		var key = getClientKey(sibling);
		
		var sib = this._siblingsObj[key];
		
		if(sib)
		{
			sib.dispose();
			delete this._siblingsObj[key];
			this._siblingsAr.splice(this._siblingsAr.indexOf(sib), 1);
		}
	},
	
	//allows for listing on messages
	'on': function(type, callback)
	{
		return this.addListener(type, callback);
	},
	
	//TRUE if a sibling exists
	'hasSibling': function(client)
	{
		return !!this._siblingsObj[getClientKey(client)];
	},
	'siblings': function()
	{
		return this._siblingsAr;
	},
	'connect': function(siblingOrPort, onConnect)
	{
		var self = this;
		
		getHostName(function(hostname)
		{
			self.hostname(hostname);
			
			function init(client)
			{	
				self._siblingPort = client.port;
				
				var srv = self._server = express.createServer(),
					mediator = self._mediator;
					
				srv.use(express.bodyParser());
				
				srv.on('error', function(e)
				{
					console.error(e)
				})
				
				self.client(client);
				
				srv.get('/connect', function(req, res)
				{
					//no port? provide one for the hook. could be hosted on the same computer
					if(!req.query.port)
					{
						req.query.port = ++self._siblingPort;
					}
					
					//send the new sibling id
					res.send(req.query);
				});
				
				srv.get('/sibling/ready', function(req, res)
				{
					self.siblings().forEach(function(sib)
					{
						sib.addSibling(req.query);
					})
					
					res.send(self.siblings());
					
					self.addSibling(req.query);
				});
				
				
				srv.get('/siblings', function(req, res)
				{
					res.send(self.siblings());
				});
				
				srv.get('/up', function(req, res)
				{
					res.send({ message: 'Hooks are up.' });
				});
				
				
				
				srv.post('/request', function(req, res)
				{
					var name = req.body.name,
						data = req.body.data,
					 	numCalls = mediator._callEmitter.getNumListeners(name),
						responses = [];
					
				
					var callback = function(data, locked)
					{
						//this shouldn't happen, but JUST in case...
						if(!numCalls) return;
						
						if(!locked) responses.push(data);
						
						//end the request if there are no more calls to be made
						if(!(--numCalls))
						{
							res.send({ responses: responses });
						}
					}
					
					try
					{
						data = JSON.parse(data);
					}catch(e)
					{
						data = callback;
					}
					
					
					self.locked.push(name);
					mediator.request(name, data, callback);
					self.locked.splice(self.locked.indexOf(name), 1);
				});
				
				
				srv.get('/add/sibling', function(req, res)
				{
					var hostname = req.query.hostname,
						port = req.query.port;
					
					var sibling = {
						hostname: hostname,
						port: port
					}	
					
					self.addSibling(sibling);
					
					res.send(sibling);
				});
				
				console.ok('Starting hooks on port %s', client.port)
					
				srv.listen(client.port);
				
				var sibling = self.nextSibling();
				
				//initial sibling? talk to it and have it introduce THIS sibling to the others!
				if(sibling)
				{
					sibling.ready(client, function(siblings)
					{
						siblings.forEach(function(sibling)
						{
							if(sibling.port == client.port && sibling.hostname == client.hostname) 
							{
								return;
							}
							
							self.addSibling(sibling);
						});
						
						self.emit('connect');
					});
				}
				else
				{
					self.emit('connect');
				}
				
			}
			
			//if the sibling exists, then we'll connect to it, and fetch a port while we're at it
			if(typeof siblingOrPort == 'string')
			{
				//add the sibling to the list
				self.addSibling(siblingOrPort);
				
				var sib = self.nextSibling();
				
				//connect to the sibling
				sib.connect(function(client)
				{
					if(client)
					{
						init(client);
					}
					else
					{
						self.removeSibling(sib);
						init(sib.client());
					}
				});
			}
			
			//otherwise this could be the initial hook. Need to start somewhere right?
			else
			{
				init({ hostname: hostname, port: siblingOrPort })
			}
			
		});	
		
		return this;
	},
	'close': function()
	{
		if(this._server) this._server.close();
		this._server = null;
	}
});

exports.Hook = Hook;