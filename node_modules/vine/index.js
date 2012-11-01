var outcome = require('outcome'),
EventEmitter = require('events').EventEmitter;


//meh, shit's ugly.
function combineArrays(c1,c2,target,property)
{
	var c1p = c1[property];
		c2p = c2[property];
		
	if(!c1p && !c2p) return;
	
	c1p = c1p || [];
	c2p = c2p || [];
	
	c1p = c1p instanceof Array ? c1p : [c1p];
	c2p = c2p instanceof Array ? c2p : [c2p];
	
	target[property] = c1p.concat(c2p);
}

function _buildMessage()
{
	var msg = arguments[0];

	//error object
	if(msg.message) msg = msg.message;
	
	for(var i = 1, n = arguments.length; i < n; i++)
	{
		msg = msg.replace(/%\w/, arguments[i]);
	}
	
	return msg;
}


var Vine = 
{

	/**
	 */
	 
	setApi: function(request)
	{
		request.api = Vine.api(request);
		
		return request;
	},

	/**
	 */

	api: function(request,methods,data)
	{
		if(!data) data = {};
		
		var methods  = methods || {};
		

		var invoker = 
		{

			/**
			 */

			error: function()
			{
				if(!arguments.length) return data.errors;

				if(arguments[0] instanceof Array) {
					arguments[0].forEach(function(err) {
						invoker.error(err);
					})
					return this;
				}
				
				if(!data.errors) data.errors = [];
				
				data.errors.push({ message: _buildMessage.apply(null, arguments)});
				return this;
			},


			/**
			 * the type of data. Used for 
			 */

			type: function(type)
			{
				if(!arguments.length) return data.type;

				data.type = type;

				return this;
			},

			/**
			 */
			 
			warning: function()
			{
				if(!arguments.length) return data.warnings;
				
				if(!data.warnings) data.warnings = [];
				
				data.warnings.push({ message: _buildMessage.apply(null, arguments)});
				return this;
			},
			
			/**
			 */
			
			'success': function()
			{
				if(!arguments.length) return data.messages;
				
				if(!data.messages) data.messages = [];
				
				data.messages.push({ message: _buildMessage.apply(null, arguments)});
				
				return this;
			},
			
			/**
			 */
			 
			combine: function(api)
			{
				var thisData = data,
					thatData = api.data || api,
					newData = {};
					
				for(var i in thisData) newData[i] = thisData;
				
				combineArrays(thisData,thatData,newData,'errors');
				combineArrays(thisData,thatData,newData,'warnings');
				combineArrays(thisData,thatData,newData,'messages');
				combineArrays(thisData,thatData,newData,'result');
				
				return Vine.api(null,null,newData);
			},

			/**
			 */
			 

			redirect: function(to)
			{
				if(!arguments.length) return data.redirect;
				
				data.redirect = to;
				return this;
			},

			/**
			 */
			 
			message: function(msg)
			{
				if(!arguments.length) return data.message;
				
				data.message = _buildMessage.apply(null, arguments);
				return this;
			},

			/**
			 */

			method: function(method)
			{
				if(!arguments.length) return data.method;
				data.method = method;
				return this;
			},

			/**
			 */

			list: function(data)
			{
				this.result(data);
				return this.method('list');
			},

			/**
			 */

			add: function(data)
			{
				this.result(data);
				return this.method('add');
			},

			/**
			 */

			remove: function(data)
			{
				this.result(data);
				return this.method('remove');
			},

			/**
			 */

			update: function(data)
			{
				this.result(data);
				return this.method('update');
			},

			/**
			 */
			 
			result: function(result)
			{
				if(!arguments.length) return data.result;
				
				data.result = result;
				return this;
			},

			/**
			 */
			 
			results: function(result)
			{
				if(!arguments.length) return data.result;
				
				if(!(data.result instanceof Array)) data.result = [];
				data.result.push(result);
				return this;
			},
			
			/**
			 */
			 
			ttl:function(ttl)
			{
				if(ttl > -1)
					data.ttl = ttl;
					
				return this;
			},


			/**
			 */
			 
			end: function(target)
			{
				if(target)
				if(target.end)
				{
					target.end(data);
				}
				else
				if(typeof target == 'function')
				{
					target(data);
				}
				
				return data;
			},

			/**
			 */

			fn: function(fn)
			{
				if(data.errors) 
				{
					target(data.errors.length > 1 ? data.errors : data.errors[0]);
				}
				else
				{
					fn(null, data.result);
				}	
			},

			/**
			 */

			onOutcome: function(resp, messages) 
			{
				if(messages) {
					messages.resp = resp;
				}

				if(!messages) messages = {};


				return outcome.error(function(err) 
				{
					invoker.error(messages.error || (err ? err.message : err));
						
				}).success(function(result) 
				{
					invoker.result(messages.success || result);

				}).done(function() 
				{
					if(messages.resp) invoker.end(messages.resp);

				});
			},

			/**
			 */
			 
			toJSON: function()
			{
				return invoker.data;
			}
		}
		
		invoker.data = data;


		return invoker;

	}
}

exports.api = Vine.api;

var v = Vine.api();

Object.keys(v).forEach(function(method) {
	exports[method] = function() {
		var api = exports.api();

		return api[method].apply(api, arguments);
	}
})



