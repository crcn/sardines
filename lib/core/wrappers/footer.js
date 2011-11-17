var entries = $entries,
	module = {};

for(var i = entries.length; i--;)
{
	var entry = entries[i];
	
	for(var property in entry)
	{
		module[property] = entry[property];
	}
}

return module;