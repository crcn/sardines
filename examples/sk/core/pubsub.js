var events = require('./events'),
sk = require('./struct'),       
queue = require('./queue'),
garbage = require('./garbage');



var AbstractProxy = sk.Structr(	{

	/**
	*/

	'__construct': function()
	{
		//cleans up after event listeners
		var janitor = this._janitor = new garbage.Janitor();

		//emitter for whenever a new subscribtion is made, or a "subscription" call is made
		janitor.addDisposable(this._callEmitter = new events.EventEmitter());

		//emitter for whenever a change is made
		janitor.addDisposable(this._changeEmitter = new events.EventEmitter());
	},

	/**
	* subscribes to any publishes by the given proxy
	* @type the type of subscription to listen for
	* @callback the callback for the subscription 
	*/

	'subscribe' : function ( type, callback )
	{

		var disposable = this._changeEmitter.addListener(type, callback);

		//listen to any changes
		return disposable;
	},
	

	/**
	* subscribes, and makes a request
	*/

	'subscribeAndRequest': function(type, data, callback)
	{
		if(!callback)
		{
			callback = data;
		}
		
		var disposable = this.subscribe(type, callback);

		this.request(type, data, callback, true);

		return disposable;
	},

	/**
	* subscribes to ONE change, then disposes
	*/

	'subscribeOnce': function(type, callback)
	{
		var disposable = this.subscribe(type, function()
		{
			disposable.dispose();
			callback.apply(null, arguments);
		});
	},

	/**
	* returns the current subscription only. must have onSubscribe on other end
	* @type the subscription type to call
	* @data data to pass to the call emitter
	* @callback the callback for the subscription
	*/

	'request': function ( type, data, callback, ignoreWarning)
	{
		if(!callback && typeof data == 'function')
		{
			callback = data;
		}                  
		
		if(!data)
		{
			data = callback;
		}

		//just a warning if it doesn't exist... helps debugging
		if(!ignoreWarning && !this._callEmitter.hasEventListener(type))
		{
			console.warning('The pubsub request "'+type+'" does not exist!');
		}


		//notify on subscription listeners of the new binding. 
		this._callEmitter.emit(type, data, callback);
	},

	'passiveRequest': function(type, data, callback)
	{
		if(!callback)
		{
			callback = data;
			data = null;
		}

		//if passive, and there isn't a call listener, then callback immediately. This is necessary for 
		//architectures where the are plugins
		if(!this._callEmitter.hasEventListener(type))
		{
			return callback();
		}

		this.request(type, data, callback);
	},


	/**
	* called when a subscription is made
	*/

	'onRequest': function ( type, singleton, callback )
	{
		if(!callback)
		{
			callback = singleton;
			singleton = false;
		}

		if(singleton && this._callEmitter.hasEventListener(type))
		{
			throw new Error('Only one "' + type + '" call handler can be registered.');
		}

		return this._callEmitter.addListener(type, callback);
	},

	/**
	* publishes a change
	*/

	'publish': function ( type, data )
	{
		this._changeEmitter.emit(type, data);
	},

	/**
	* disposes the pubsub proxy
	*/

	'dispose': function ()
	{
		this._janitor.dispose();
	}
});


var ConcreteProxy = AbstractProxy.extend({

	/**
	* need to override subscribe so we can transform the type if it's an object, chain, etc.
	*/

	'override subscribe': function(type, callback)
	{
		if(typeof type == 'object')
		{
			var janitor = new garbage.Janitor();

			for(var subType in type)
			{
				janitor.addDisposable(this.subscribe(subType, type[subType]));
			}

			return janitor;
		}

		return this._super(type, callback); 
	},
	

	/**
	* also need to transform the onRequest...
	*/

	'override onRequest': function(type, singleton, callback)
	{		
		if(typeof type == 'object')
		{
			var janitor = new garbage.Janitor();

			for(var subType in type)
			{
				var callHandler = type[subType],
				cb;

				if(typeof callHandler == 'function')
				{
					cb = callHandler;
					singleton = false;
				}
				else
				{
					cb = callHandler.callback;
					singleton = callHandler.singleton;
				}


				janitor.addDisposable(this.onRequest(subType, singleton, cb));
			}

			return janitor;
		}
		
		this._super(type, singleton, callback);
	}
});


var ProtectedProxy = ConcreteProxy.extend({
	'override __construct': function()
	{
		this._super();
		
		this._channelsByMetadata = [];
		
		var self = this;

		//on subscription to channels, return all of them. useful for remote pub/subs 
		this.onRequest('public channels', true, function(protectedKey, callback)
		{
			var channels;
			
			if(protectedKey == self.key())
			{
				channels = self._channelsByMetadata.protected || [];
			}
			
			channels = channels.concat(self._channelsByMetadata.public || []);
			
			var i = channels.indexOf('channels');
			if(i > -1) channels.splice(i, 1);
			
			callback(ac);
		});
	},
	
	'grantRequestAccess': function(channel, key)
	{
		return this.hasChannel('public') || (!this.hasChannel('private', channel) && !(this.hasChannel('protected', channel) && key != this.key()));
	},
	
	'hasChannel': function(metadata, type)
	{
		return (this._channelsByMetadata[metadata] || []).indexOf(type) > -1;
	},
	
	'channels': function(metadata)
	{
		if(metadata) return this._channelsByMetadata[metadata];
		return this._channels;
	},
	
	'key': function(value)
	{
		if(value) this._key = value;
		return value;
	},
	
	'override subscribe': function(type, callback)
	{
		if(typeof type != 'string') return this._super(type, callback);
		return this._super(type.split(' ').pop(), callback);
	},
	
	
	'override onRequest': function(type, singleton, callback)
	{
		if(typeof type != 'string') return this._super(type, singleton, callback);
		
		var metadata = type.split(' '),
			name = metadata.pop();
			
		//publish the change
		if(!this._callEmitter.hasEventListener(name))
		{
			if(!metadata.length)
			{
				metadata.push('private');
			}
			
			for(var i = metadata.length; i--;)
			{
				var md = metadata[i];
				
				if(!this._channelsByMetadata[md]) this._channelsByMetadata[md] = [];
				
				this._channelsByMetadata[md].push(name);
			}
		}
		
		return this._super(name, singleton, callback);
	}
})


        

                            
/**
 * the transport between two proxies
 */

var Transport = sk.Structr({
	                                                 
	                
	
	/**   
	 * connects to the remote connection
	 */
	
	'connect': function(callback) { },      
	
	/**                                          
	 * sends data over to the remote transport
	 */
	
	'send': function(obj) { }
});

                    
/**                                                      
 * glues two remote proxies together
 */                                                   

var RemoteProxyGlue = sk.Structr({  
	
	/**
	 * @param proxy the proxy we're glueing to
	 * @param transport the remote connection between this app, and anything remote
	 */
	
	'__construct': function(transport, proxy)
	{                            
		this._transport = transport;       
		this._proxy = proxy || new ProtectedProxy(); 
		this._requests = {};       
		                        
		//override the messahge
		transport.onMessage = this.getMethod('handleMessage');
		
		this._start();    
	},            
	
	/**
	 * handles the message passed from the transport
	 */
	
	'handleMessage': function(msg)
	{                                            
		                         
		var trans = this._transport,                
			proxy = this._proxy,       
			self = this;   
			                        
		//ignores sending out to remote transports. Fixes infinite loop problems    	
		this.ignore(msg.name, true);
		
		
		if(msg.action == 'request' || msg.action == 'publish')
		{
			//make sure the request is not protected before making it
			if(proxy.grantRequestAccess(msg.name, (msg.data || {}).requestKey))
			{
				if(msg.action == 'request')
				{
					proxy.request(msg.name, msg.data, function(response)
					{                                        
						self._send('response', msg.name, response, msg.uid);
					});
				}
				else
				{
			  		proxy.publish(msg.name, msg.data);
				}
			}
			else
			{
				self._send('response', msg.name, 'You cannot call '+msg.name+'.', msg.uid);
			}
		}   
		else
		if(msg.action == 'response')
		{
			var callback = self._requests[msg.uid];      
			   
			if(callback && msg.data)
			{
				callback(msg.data);  
			}
			else
			if(msg.error)
			{
				console.warn(msg.error);
			}
			
			delete this._requests[msg.uid];
		}                     
		                      
		this.ignore(msg.name, false);      
	},
	
	/**
	 */
	
	'_start': function()
	{    
		var self = this,
		    oldPublish = this._proxy.publish;
		
		this._proxy.publish = function(name, data)
		{
			oldPublish.apply(self._proxy, arguments);         
			if(!self.ignore(name)) self._send('publish', name, data); 
		}
		                      
		
		//connect the transport                              
		this._transport.connect(function()
		{                               
			                   
			//get all the channels so we can listen for them
			self._request('channels', self._proxy.key(), function(channels)
			{                                                           
				
				function listenToChannel(name)
				{                                            
					self._proxy.onRequest(name, function(data, callback)
					{   
						if(typeof data == 'function')
						{
							callback = data;
							data = undefined;
						}                       
						                               
						if(!self.ignore(name)) self._request(name, data, callback); 
					})
				}
				
				for(var i = channels.length; i--;)
				{
					var channel = channels[i];
					if(channel == 'channels') continue;
					listenToChannel(channel);
				}                            
				                                 
				self.ignore('transportReady', true);      
				self._proxy.publish('transportReady'); 
				self.ignore('transportReady', true);
			});
		});
	},
	
	/**   
	 * sends off a remote request with a callback attached
	 */
	
	'_request': function(name, data, callback)
	{              
		if(typeof data == 'function')
		{
			callback = data;
			data = undefined;
		}           
		
		//dirty UID
		var uid = new Date().getTime() + '.' + Math.round(Math.random() * 999999);
		
		this._requests[uid] = callback;
		
		this._send('request', name, data, uid); 
	},
	    
	/**
	 * sends a message off to the transport
	 */
	
	'_send': function(action, name, data, uid)
	{
		this._transport.send({ action: action, name: name, data: data, uid: uid });
	},
	
	'_error': function(action, name, error, uid)
	{
		this._transport.send({ action: action, name: name, error: error, uid: uid });
	},
	
	'ignore': function(name, value)
	{                                       
		if(!this._ignoring) this._ignoring = [];
		var i = this._ignoring.indexOf(name);
		          
		if(value == undefined) return i > -1;
		                                            
		if(!value && i > -1)
		{
			this._ignoring.splice(i, 1);
		}                             
		else
		if(value && i == -1)
		{
			this._ignoring.push(name);
		}
		
		
	}
});


exports.Proxy = ProtectedProxy; 
exports.Transport = Transport;
exports.RemoteProxyGlue = RemoteProxyGlue;
exports.Mediator = new exports.Proxy();