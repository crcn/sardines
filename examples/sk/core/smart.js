//don't burn CPU cycles with lots of intervals/timeouts
require('./sk');

exports.smart = (function(){
    
	//callbacks we're running
	var intervalCallbacks = {};

	function addCallback(callbacks, callback, ms)
	{     
		var cb;
		if(!(cb = callbacks[ms]))
		{                       
			cb = callbacks[ms] = [];
			
			var interval = setInterval(function()
			{                               
				var now = new Date().getTime();      
				                         
				
				for(var i = cb.length; i--;)
				{
					var callback = cb[i];
					if(callback.nextUpdate <= now)
					{
						callback.callback();
						callback.nextUpdate += ms; 
					}
				}                 
				                            
				if(!cb.length)
				{                         
					clearInterval(interval);     
					callbacks[ms] = null;
				}
			},ms)                          
		}                                  
		
		var target = {callback:callback,nextUpdate:new Date().getTime()+ms,interval:ms}; 
		
		cb.push(target);
		
		return {
			stop:function()
			{              
				var i = cb.indexOf(target); 
				if(i > -1) cb.splice(i,1)
			}
			
			//make it a disposable
			,dispose:function()
			{
				this.stop();
			}
		}
	}
	
	this.interval = function(callback, ms)
	{                                          
		return addCallback(intervalCallbacks,callback,ms || 0);     
	}
	
	this.timeout = function(callback, ms)
	{
		var ret =  addCallback(intervalCallbacks,function()
		{
			ret.stop();
		   callback();
		},ms || 0); 
		
		return ret;    
	}
	
	return this;     
	
})()    


exports.smart.Cacher = function(max,name,cacheToDB)
{
	this.max = max || -1;   
	
	var count = 0,
		values = {},
		DUMP_COUNT = 10
	
	var interval = exports.smart.interval(function(now)
	{                                            
		for(var i in values)
		{
			var v = values[i];
			if(v.deleteAt < now)
			{
				delete values[i];
			}
		}
	},1000);
	
	
	this.set = function(key, value, ttl)
	{
		if(this.max && count > this.max)
		{
			var dumped = 0;
			
			//find the item that hasn't been accessed a lot
			/*for(var key in values)
			{
				var k = values[key];
				
				if(k.accessed < )
			}*/
			return;
		};

        values[key] =  { value: value, deleteAt: new Date().getTime() + ttl, ttl: ttl, accessed: 0 };

		return value;
	} 
	
	this.addTime = function(key,ms)
	{
		var v = values[key];
		if(v) v.deleteAt += ms;
	}       
	
	this.reset = function(key)
	{
		var v = values[key];    
		if(v) this.set(key,v.value,v.ttl);
	}
	
	this.getTimeLeft = function(key)
	{
		var v = values[key]; 
		
		if(v)
		{
			var now = new Date().getTime();
			
			if(v.deleteAt < now) 
			{
				delete values[key];
				return 0;
			}
			
			return v.deleteAt-now;
		}
			
		return 0;
	}
	
	this.get = function(key)
	{
		var v = values[key]; 
		
		if(v && this.getTimeLeft(key))
		{
			v.accessed++;
			return v.value;
		}
		return null;
	}
	
	this.dispose = function()
	{
		interval.stop();
		values = {};
	}
	
}
  