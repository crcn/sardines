var fs = require('fs');

exports.lstat = function(file)
{
	try
	{
		return fs.lstatSync(file);
	}
	catch(e)
	{
		return null;
	}
}
exports.resolve = function(script)
{
	try
	{
		return require.resolve(script);
	}
	catch(e)
	{
		return null;
	}
}

exports.WatchJanitor = function(file)
{
	var watching = [],
		children = {},
		self = this;
	
	this.file = file;
	
	this.watch = function(file, onChange)
	{
		fs.watchFile(file, onChange);
		
		watching.push(file);
	}
	
	this.dispose = function()
	{
		watching.forEach(function(file)
		{
			fs.unwatchFile(file);
		});
		
		for(var file in children)
		{
			child[file].dispose();
		}
		
		children = {};
		
		if(self.ondispose) self.ondispose();
	}
	
	this.addChild = function(janitor)
	{
		var oldChild = children[janitor.file];
		
		if(oldChild) oldChild.dispose();
		
		children[janitor.file] = janitor;
		
		janitor.ondispose = function()
		{
			delete children[janitor.file];
		}
	}
}

exports.boom = function()
{
	console.log('BOOMshakalaka'.rainbow)
}