var entries = $$$entries,
	module = {};

if(typeof window == 'undefined') {
	global.window = global;
}

if(typeof window.process == 'undefined') {
	window.process = {};
}

process.title = 'sardines';
process.cwd = function() {
	return "/";
}



for(var i = entries.length; i--;)
{
	var entry = _sardines.require(entries[i]);

	for(var property in entry)
	{
		module[property] = entry[property];
	}
}

return module;