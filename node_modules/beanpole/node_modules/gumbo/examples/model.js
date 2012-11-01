var gumbo = require('../lib/index');

var TestModelPart = {
	
	/**
	 */
	
	'sayHello': function()
	{
		console.log("HELLO");
	},
	
	/**
	 */
	
	'static test': function ()
	{
		
	}
	
};


var col = gumbo.db({
	persist : {
		ini: __dirname
	}
}).collection({
	name: 'test',
	model: TestModelPart
});

var TestModel = col.model;


TestModel.findOne({ name: 'craig' }, function(err, found)
{
	console.log(found)
	found.remove();
});



col.find({ _id: 'program:gumbo' }, function(err, found)
{
	console.log(found);
});

col.insert({ _id: 'program:test', persist: 'no', blarg: { test: 'value'} });