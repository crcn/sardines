var Structr = require('structr').Structr,
	fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec;


var Dirty = Structr({
	'__construct': function(dbPath)
	{ 
		exec('mkdir -p '+ path.dirname(dbPath));
		
		this._settings = {};
		if(dbPath) this.open(dbPath);
	},
	'open': function(dbPath)
	{
		this._dbPath = dbPath;
		
		try
		{
			this._settings = JSON.parse(fs.readFileSync(dbPath));
		}catch(e)
		{
			
		}
	},
	'set': function(name, value)
	{
		this._settings[name] = value;
		this._save();
		return value;
	},
	'get': function(name)
	{
		return this._settings[name];
	},
	'_save': function()
	{
		fs.writeFileSync(this._dbPath, JSON.stringify(this._settings));
	}
})


exports.dirty = function(dbName)
{
	return new Dirty(dbName);
}