var mustache = require('mustache'),
fs = require('fs');

exports.load = function(ops, file)
{
	var buffer = fs.readFileSync(file,'utf8');
	
	for(var prop in ops)
	{
		var search = new RegExp('\\$' + prop, 'g');
		
		buffer = buffer.replace(search, ops[prop]);
	}
	return buffer;
	return mustache.to_html(buffer, ops);
}