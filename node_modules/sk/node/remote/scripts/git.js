var child_process = require('child_process'),
	exec = child_process.exec,
	fs = require('fs');
	
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//this class was developed as a ssh script for server clusters
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
function toArray(obj)
{
	var stack = [];
	for(var prop in obj)
	{
		stack.push(obj[prop])
	}
	return stack;
}
	
exports.update = function(config, callback)
{
	if(!callback) callback = function(){};
	
	if(!config.path && !(config instanceof Array))
	{
		config = toArray(config);
	}
	
	
	if(config instanceof Array)
	{
		function nextConfig()
		{
			if(!config.length)
			{
				return callback();
			}
			
			//queue it up
			exports.update(config.shift(), nextConfig);
		}
		
		return nextConfig();
	}
	
	exec('mkdir -p '+config.path, function()
	{	
		console.log('cloning '+config.repository+'...');
		exec('git clone '+config.repository+' ./',{ cwd: config.path }, function()
		{
			exec('git pull',{ cwd: config.path }, function()
			{
				try
				{
					var installBin = config.path + '/bin/install';
					
					var stat = fs.lstatSync(installBin);
					
					exec(installBin, {cwd:config.path + '/bin'}, callback);
				}
				catch(e)
				{
					callback();
				}
			});
		});
	});
}

if(process.argv[2])
{
	try
	{
		exports.update(JSON.parse(process.argv[2]));
	}catch(e)
	{
		
	}
}