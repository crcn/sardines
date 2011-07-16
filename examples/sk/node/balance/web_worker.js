var exec = require('child_process').exec;



function getController(callback)
{
	var ret = function(data, uid)
	{
		callback(data, function(response)
		{
			postMessage({
				data: response,
				uid: uid
			})
		})
	};
	
	ret.callback = callback;
	
	return ret; 
}



function registerController(callback, name)
{
    if (actions[name]) 
        throw new Error('the web-worker handler "' + name + '" already exists.');
    
    //register the web method now
    actions[name] = getController(callback);
}

var pinging = false;

var actions = {
    loadSource: function(source)
    {
        var controller = require(source).controller;
        
        try 
        {
            for (var name in controller) 
            {
                registerController(controller[name], name);
            }
        } 
        catch (e)
		{
			console.error(actions[name].callback.toString())
			console.error('error for '+ source);
            console.error(e.stack);
        }
    }, 
	pong: function()
	{
		pinging = false;
	}
}



setInterval(function()
{
	if(pinging)
	{
		console.warning('Worker appears to be headless, killing.');
		
		return process.exit();
		
		return;
	}
	
	pinging = true;
		
	postMessage({ ping: 'ping!' });	
},5000);


onmessage = function(m)
{
    var data = m.data;
    
    try 
    {
        for (var type in data) 
        {
            if (type == 'uid') 
                continue;
            
            var action = actions[type];
            
            action(data[type], data.uid)
            break;
        }
    } 
    catch (e) 
    {
        console.error(e.stack)
    }
}
