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

exports.pod = function(mediator)
{                                              

	var packager = {
		test: function(source)
		{
			return lstat(source) && source.indexOf('.js') > -1;
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
					mediator.push('notify.user', { message: 'Rebuilt '+output.split('/').pop() });
					
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
		pull.callback(packager);
	}

	function getScanner(pull)
	{
		pull.callback(packager);
	}

	mediator.on({
		'pull sard.scanner': getScanner,
		'pull sard.packager': getPackager
	})
}