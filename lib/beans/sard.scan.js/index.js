var sdutils = require('sdutils'), 
lstat = sdutils.lstat,
resolve = sdutils.resolve,
fs = require('fs'),
path = require('path'),
Queue = require('sk/core/queue').Queue,
WatchJanitor = sdutils.WatchJanitor,
vm = require('vm'),
growl = require('growl'),
scanner = require(__dirname + '/lib/scanner');

exports.plugin = function(mediator)
{                                              

	var packager = {
		test: function(source)
		{
			if(source instanceof Array) source = source.join(',');


			return source.split('.').pop() == 'js';
		},
		write: function(ops, callback, janitor)
		{
			var input = ops.input,
				output = ops.output,
				required = [];
				
			if(!janitor) janitor = new WatchJanitor(input);
				
			if(ops.janitor) ops.janitor.addChild(janitor);
			
			function watch()
			{
				function onFileChange(curr, prev)
				{
					mediator.push('notify/user', { message: 'Rebuilt '+output.split('/').pop() });
					
					janitor.dispose();
					packager.write(ops, null, janitor);
				}
				
				required.forEach(function(file)
				{
					janitor.watch(file.path, onFileChange);
				});
			}                 
			
			var buffer = '';

			 
			scanner.combineJs(input, {
				require: function(source)
				{
					required.push({ path: source });
				},
				write: function(chunk)
				{
					buffer += chunk;
				},
				end: function()
				{          
					fs.writeFileSync(output, buffer);   

					if(ops.watch) watch();
					if(callback) callback();
				}
			});
		}
	}
	
	function getPackager(pull)
	{
		pull.end(packager);
	}

	function getScanner(pull)
	{
		pull.end(packager);
	}

	mediator.on({
		'pull -multi sard/scanner': getScanner,
		'pull -multi sard/packager': getPackager
	})
}