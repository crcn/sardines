var sk = require('./struct'),
Structr = sk.Structr;

exports.EventEmitter = {
	'__construct': function ()
	{                      
		this._listeners = {};
	},
	'addListener': function (type, callback)
	{             
		(this._listeners[type] || (this._listeners[type] = [])).push(callback);       
		var self = this;
		
		return {
			dispose: function ()
			{                                
				self.removeListener(type, callback);
			}
		}
	},
	'hasEventListener': function(type, callback)
	{
		return !!this._listeners[type];
	},
	'getNumListeners': function(type, callback)
	{
		return this.getEventListeners(type).length;
	},
	'removeListener': function (type, callback)
	{
		var lists = this._listeners[type],i,
		   self = this;
		if(!lists) return;  
		if((i = lists.indexOf(callback)) > -1)
		{
			lists.splice(i,1);
			
			if(!lists.length)
			{
				delete self._listeners[type];
			}
		}
	},
	'getEventListeners': function(type)
	{
		return this._listeners[type] || [];
	},
	'removeListeners': function (type)
	{
		delete this._listeners[type];
	},
	'removeAllListeners': function()
	{
		this._listeners = {};
	},
	'dispose': function ()
	{
		this._listeners = { };
	},
	'emit': function ()
	{                 
		var args = [],
			type = arguments[0],
			lists;
			
		for(var i = 1, n = arguments.length; i < n; i++)
		{
			args[i-1] = arguments[i];
		}       
		
		
		if(lists = this._listeners[type])  
		for(var i = lists.length; i--;)
		{                       
			lists[i].apply(this, args);
		}     
	}
}

exports.EventEmitter = Structr(exports.EventEmitter);