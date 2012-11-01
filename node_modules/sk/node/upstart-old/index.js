var child_process = require('child_process'),
	exec = child_process.exec,
	Process = require('../process').Process;

var exists = function(path)
{
	try
	{
		fs.lstatSync(path);
		return true;
	}
	catch(e)
	{
		return false;
	}
}

var daemon = function(command, name, root, checkPort)
{
	
	if(!root) root = '/node/upstart/';
	if(!checkPort) checkPort = 80;

	var absRoot = root + '/' + name;
	
	return {
		start: function(callback)
		{
			var cp = command.split(' ');
			var bin = cp.shift(),
				args = cp.join(' ');
				
			var p = new Process(__dirname + '/start', [bin, args, absRoot, name, checkPort], {cwd:__dirname});
			
			
			p.onExit = function()
			{
				if(callback) callback();
			}
				
		},
		stop: function(callback)
		{
			var p = new Process(absRoot + '/stop', ['purge'], {cwd:absRoot});
			p.onExit = function()
			{
				if(callback) callback();
			}
		}
	}
}


exports.daemon = daemon;