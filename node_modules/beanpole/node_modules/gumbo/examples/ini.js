var gumbo = require('../lib/index'),
col = gumbo.db({ async: false, persist: { 'ini': __dirname } }).collection('test');


col.find({ _id: 'program:gumbo' }, function(err, found)
{
	console.log(found);
});

col.insert({ _id: 'program:test', persist: 'no', blarg: { test: 'value'} });