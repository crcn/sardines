fs = require('fs');

var cache = {};

exports.parseFile = function(ops, file) {
	var buffer = cache[file] || (cache[file] = fs.readFileSync(file,'utf8'));

	return exports.parse(ops, buffer);
}


exports.parse = function(ops, buffer) {


	for(var prop in ops) {
		var search = '$$$' + prop,
		index, i = 0;

		while((index = buffer.indexOf(search)) > -1)  {

			buffer = buffer.substr(0,index) + ops[prop] + buffer.substr(index + search.length);

		}
	}

	return buffer;
}
