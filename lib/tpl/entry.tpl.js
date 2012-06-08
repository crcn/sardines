var entries = $$$entries,
	module = {},
	process = {
		title: 'browser'
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