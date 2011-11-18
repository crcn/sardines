var mustache = require('mustache'),
fs = require('fs');

exports.load = function(ops, file)
{
	var buffer = fs.readFileSync(file,'utf8');
	
	for(var prop in ops)
	{
		var search = '$'+prop,
		index;
		
		while((index = buffer.indexOf(search)) > -1) 
		{
			buffer = buffer.substr(0,index)+ops[prop]+buffer.substr(index+search.length);
			
		}
	}
	
	fs.writeFileSync(process.env.HOME + '/test.js', buffer)
	return buffer;
	//return mustache.to_html(buffer, ops);
}

