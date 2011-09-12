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
	if(!file) throw new Error('A file name must be present for WatchJanitor');
	
	var watching = [],
		children = {},
		self = this,
		disposed = false;
	
	this.file = file;
	
	this.watch = function(file, onChange)
	{
		function callback(cur, prev)
		{
			if(+cur.mtime === +prev.mtime) return;
			
			onChange(cur, prev);
		}
		var watch = fs.watchFile(file, callback);
		
		watching.push(file);
	}
	
	this.dispose = function()
	{
		
		disposed = true;
		
		watching.forEach(function(file)
		{
			fs.unwatchFile(file);
		});
		
		for(var file in children)
		{
			children[file].dispose();
		}
		
		children = {};
		
		if(self.ondispose) self.ondispose();
	}
	
	this.child = function(file)
	{
		return this.addChild(new exports.WatchJanitor(file));
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
		return janitor;
	}
}

exports.boom = function()
{
	console.log('BOOMshakalaka'.rainbow)
}