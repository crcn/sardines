var fs = require('fs'),
	pubsub = require('../../core/pubsub');

function loadDirectory(dir, mediator, onLoadCallback)
{                    
	if(!onLoadCallback)
	{
		onLoadCallback = mediator;
		mediator = pubsub.Mediator;
	}
	                 
	fs.readdir(dir,function(err,files)
	{     
		
		var plugins = [];
		
		if(files)
		files.forEach(function(name)
		{  
			
			//no private files plz
			if(name.substr(0,1) == '.')
				return;
				
			var baseName = name.split('.').shift();
			
			console.verbose("loading plugin:" + name);    
			
			var p = require(dir + "/" + baseName);
			
			//plug it in!
			if(p.plugin) p.plugin(mediator);
			
			
			plugins.push(p);
			
		});                             
		                  
		if(onLoadCallback) onLoadCallback(plugins);
	});
}


exports.loadDirectory = loadDirectory;

