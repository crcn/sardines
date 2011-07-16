require('./sk');

exports.lazy = {
	callback:function(callback,timeout)
	{       
		var interval;
		
		return function()
		{                   
			clearTimeout(interval);     
			var args = arguments;
			                              
			interval = setTimeout(function()
			{
				callback.apply(callback,args);
			},timeout);
		}
	}
}                     


                           