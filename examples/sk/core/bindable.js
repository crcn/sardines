var pubsub = require('./pubsub');

var Bindable = {
	apply: function(target, proxy, setting)
	{
		if(!proxy) proxy = new sk.Proxy();      
		
		return target instanceof Array ? this.applyArrayBindings(target, proxy, setting) : this.applyObjectBindings(target, proxy, setting);
	},     
	applyObjectBindings: function(target, proxy, setting)
	{
		var props = Structr.findProperties(target, setting || 'bindable');
        
        
		//next go through all the properties and look for the bindable ones
        for(var i = props.length; i--;)
        {
            this.bindObject(proxy, target, props[i]);
        }
        
        return { properties: props, proxy: proxy };
	},  
	bindObject: function(proxy, target, explicitGS)
	{
		//we need to reference the old function since we're just wrapping around it
		var oldGS = target[explicitGS];
		
		//if there's a new subscription, then fetch the current data and return it
		proxy.onRequest(explicitGS, function(callback)
		{
			var gs = target[explicitGS];
			callback(gs())
		});
		
		//overwrite the old property with the new bindable property
		var newGS = target[explicitGS] = function()
		{
			                              
			//if there are arguments, then we're setting a new value
			if(arguments.length)
			{
				//call the old func
				oldGS.apply(target, arguments);
				
				//emit if anything changes
				proxy.publish('propertyChange', {name: explicitGS, value: arguments[0] });
				                                    
				//so we need to publish to the change so any subscriptions get notified
				proxy.publish(explicitGS, arguments[0]);
			}
			else
			{
				//otherwise just return the old data
				return oldGS.apply(target, []);
			}
		}
		
		//allow for the function to be subscribable
		newGS.subscribe = function(callback)
		{
			return proxy.subscribe(explicitGS, callback);
		}
        
        //allow for the function to be subscribable
		newGS.subscribeOnce = function(callback)
		{
			return proxy.subscribeOnce(explicitGS, callback);
		}         
		
        //allow for the function to be subscribable
		newGS.subscribeAndRequest = function(callback)
		{
			return proxy.subscribeAndRequest(explicitGS, callback);
		}
	},
	applyArrayBindings: function(target, proxy)
	{                   
		      
		function argsToArray(args)
		{       
			var ar = new Array(args.length);
			                                
			for(var i = args.length; i--;)
			{
				ar[i] = args[i];
			}                    
			return ar;
		}     
		
		function rep(prop, callback)
		{             
			if(prop instanceof Array)
			{
				for(var i = prop.length; i--;)
				{
					rep(prop[i], callback);
				}                          
				return;
			}           
			
			var oldProp = target[prop];     
			                           
			target[prop] = function()
			{                              
				oldProp.apply(target, arguments);                     
				callback(argsToArray(arguments));     
			}
		}    
		
		function change(data, args)
		{                            
			proxy.publish('change', data);
		}   
		
		function add(items, index)
		{                         
			if(items.length) change(target);            
			// change({type: 'add', items: items, index: index});
		}
		
		function remove(items, index)
		{       
			if(items.length) change(target);
			// change({type: 'remove', items: items, index: index});
		}
		
		function reset()
		{
			// change({type: 'reset'});
		}     
		
		      
		target.subscribe = function(callback)
		{                                
			var disposable = proxy.subscribe('change', callback);
		}
		
		target.subscribeAndRequest = function(callback)
		{                                
			target.subscribe(callback);
			callback(target)
		}
		              
		rep('push', function(items)
		{                           
			add(items, target.length);
		});                            
		
		rep('unshift', function(items)
		{
			add(items, 0);
		})                
		        
		rep('splice', function(args)
		{
			var start = args[0],
			n = args[1],
			items = [];

			for(var i = start; i < n; i++)
			{
            	items.push(target[i]);
			}                         
			
			remove(items, start);
		});  
		
		rep(['sort','slice','reverse'], reset);       
		                                                               
		                   
		return target;
	}
}


exports.Bindable = Bindable;