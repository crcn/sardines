What's this?
------------

A layer ontop of uglify-js to help make traversing, and handling javascript Abstract Synax Trees easier. 

Why?
----

The tool was original developed for [sardines](https://github.com/spiceapps/sardines).

What's it do exactly?
---------------------

- Creates expressions out of the arrays uglify-js spits out.
- Identifies variables, their references, and their scope.
- Easily walk through the AST.

What about the name?
--------------------

AST-er, get it? Aster's a flower, but it's not a spice :/. Whatever, I bet it's still edible.


Code Usage:
-----------
                                                               
````javascript

var aster = require('aster');

var ast = aster.parse('var hello = "hello", hello2 = "world!"; console.log(hello); var anotherRef = hello;');

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

````


To Do:
-----

- Ability to easily replace expressions in the AST.
- Light evaluation of ASTs (for ability to further transform code).
- Fix indendation - textmate -> github screwed my shit up.






