var mustache = require('mustache'),
fs = require('fs');

var cache = {};

exports.load = function(ops, file)
{
	file += '.tpl';

	var buffer = cache[file] || (cache[file] = fs.readFileSync(file,'utf8'));
	
	for(var prop in ops)
	{
		var search = '$$$'+prop,
		index, i = 0;

		while((index = buffer.indexOf(search)) > -1) 
		{
			buffer = buffer.substr(0,index)+ops[prop]+buffer.substr(index+search.length);
		}
	}
	
	return buffer;
	//return mustache.to_html(buffer, ops);
}

