var utils = require('sdutils'),
	lstat = utils.lstat,
	resolve = utils.resolve,
	fs = require('fs'),
	Queue = require('sk/core/queue'),
	path = require('path');

exports.plugin = function(mediator)
{
	function init()
	{
		// mediator.pull('sard.html.combiner')
	}
	function testFile(file)
	{
		if(!lstat(file)) return null;
		
		var ext = file.split('.').pop();
		
		return ext == 'html' || ext == 'leaf';
	}
	function getScanner(pull)
	{
		var scanner = {
			test: function(ops)
			{
				return testFile(ops.path);
			},
			scan: function(file, callback)
			{
				// console.log(file);
			}
		}
		
		pull.end(scanner);
	}
	
	function getPackager(pull)
	{
		var packager = {
			test: testFile,
			write: function(input, output, callback)
			{
				var data = fs.readFileSync(input,'utf8'),
				scripts = data.match(/<script.*?>.*?<\/script>/g),
				jsScripts = [],
				inputDir = path.dirname(input);
				
				function write()
				{
					fs.writeFileSync(output, data);
					callback();
				}
				
				//no scripts? continue.
				if(!scripts)
				{
					return write();
				}
				
				
				//BLAH this shouldn't be here. needs to be its own plugin to handle CSS, js, etc.
				for(var i = scripts.length; i--;)
				{
					var sc = scripts[i];
					if(sc.indexOf('.js"') == -1)
					{
						scripts.splice(i, 1);
						continue;
					}
					
					var source = sc.match(/src="(.*?)"/)[1]
					
					if(source.substr(0,1) == '.')
					{
						source = inputDir + '/' + source;
					}
					
					var jsPath = source;
					
					if((jsPath = resolve(source)) || (jsPath = resolve(inputDir + '/' + source)))
					{
						jsScripts.push(jsPath);
					}
					else
					{
						console.error('"%s" doesn\'t exist in "%s"', source, input.split('/').pop());
					}
					
					var scriptIndex = data.indexOf(sc);
					
					data = data.replace(sc,'');
				}
				
				mediator.pull('sard.combine', jsScripts, function(result)
				{
					var res = result.data.result;
					
					if(res)
					{
						var fileName = input.split('/').pop().split('.').shift()+'.js';
						
						fs.writeFileSync(path.dirname(output) + '/' + fileName, res);
						
						data = data.substr(0,scriptIndex)+'<script src="'+fileName+'"></script>'+data.substr(scriptIndex);
					}
					
					write();
				});
				
				
			}
		}
		
		pull.end(packager);
	}
	
	function getJScanner(pull)
	{
		var scanner = {
			test: testFile,
			getRequired: function(source)
			{
				
			}
		}
	}
	
	mediator.on({
		'push init': init,
		// 'pull sard.scanner': getScanner,
		'pull sard.packager': getPackager,
		'pull sard.js.scanner': getJScanner
	});
}