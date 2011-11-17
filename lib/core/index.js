var fs = require('fs'),
path = require('path'),
scanner = require('./scanner'),
mu = require('./utils/mu'),
uglify = require('uglify-js'),
parser = uglify.parser;


exports.package = function(ops, callback)
{
	var inputs = ops.input instanceof Array ? ops.input : [ops.input],
		output = ops.output;
	
	
	var body = fs.readFileSync(__dirname + '/wrappers/require.js','utf8') + '\n\n';
	
	scanner.combineJs(inputs, {
		write: function(chunk)
		{
			body += chunk + '\n\n';
		},
		end: function(entries)
		{   
			var entryBuffer = [];
			
			for(var i = entries.length; i--;)
			{
				entryBuffer.push('_sardines.require("'+entries[i]+'")');
			}       
			
			
			body += mu.load({ entries: '['+entryBuffer.toString()+']' }, __dirname + '/wrappers/footer.js')+'\n\n';
			
			body = mu.load({ body: body, name: ops.name || 'sardines' }, __dirname + '/wrappers/body.js');
			
			
			//final cleanup
			body = uglify.uglify.gen_code(parser.parse(body, false, false), { beautify: ops.pretty });
			
			fs.writeFileSync(output, body);   

			if(callback) callback();
		}
	});
}
