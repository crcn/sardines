var aster = require('../../lib');


var ast = aster.parse('var hello = "hello", hello2 = "world!"; console.log(hello); var anotherRef = hello.toString();');

var messages = ast.walk({
	'var': function(ast)
	{
		var messages = [];

		ast.values.forEach(function(vr)
		{
			messages.push(vr.name + ' is referenced ' + vr.references().length + ' times.');
		});

		return messages; //stop the walk
	}
});

messages.forEach(function(message)
{

	//hello is referenced 2 times.
	//hello2 is referenced 0 times.
	console.log(message);
});
