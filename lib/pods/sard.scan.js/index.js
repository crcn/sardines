var sdutils = require('sdutils'), 
lstat = sdutils.lstat,
resolve = sdutils.resolve,
fs = require('fs'),
path = require('path'),
Queue = require('sk/core/queue').Queue,
WatchJanitor = sdutils.WatchJanitor,
vm = require('vm'),
growl = require('growl');

exports.pod = function(mediator)
{
	var requireRegexp = /((var)?\s*\w+\s*=\s*)?require\(.*?\)(\..*?)?[,;]?/g,
		vindex = 0;
	
		
	function combineScripts(required, callback)
	{

		//don't pollute the global namespace.
		var buffer = 'if(!window.sard) var sard = {} ',
		used = {};

		required.forEach(function(dep, index)
		{

			var jsContent = fs.readFileSync(dep.path,'utf8'),
			namespace = 'sard.module' + index;

			used[dep.path] = namespace;

			jsContent = namespace + ' = {}; \n' + jsContent;

			jsContent = jsContent.replace(/exports/g, namespace);
			
			
			
			(jsContent.match(/var[\s\S]*?\;/mg) || []).forEach(function(match)
			{
				if(!match.match(/=\s*require\(/)) return;
				
				var buffer = '',
				repVars = {};
				
				match.split(',').forEach(function(vr)
				{
					var varName = vr.match(/(\w+)\s*=/)[1],
						assignedTo = vr.match(/=\s*([^;]*)/)[1],
						newVarName = 'sard.var'+(vindex++),
						//it's common to do: var req = required('..'), mod = req.mod;
						fromRequired = assignedTo.match(/^(\w+)\.\w+$/);
						
						
						//in the global NS, replace to something else.
						
					if(fromRequired)
					{
						var fromVar = fromRequired[1];
						assignedTo = assignedTo.replace(fromVar+'\.', repVars[fromVar]+'\.');
					}
						
					
						
					repVars[varName] = newVarName;
					
					buffer += newVarName + ' = ' + assignedTo + ';\n';
					
				});
				
				jsContent = jsContent.replace(match, buffer);
				
				
				for(var oldVarName in repVars)
				{
					var newVarName = repVars[oldVarName];
					
					//needs something after the var. breaks if there isn't e.g: 
					//var bindable = require('bindable');
					//....
					//'explicit bindable test' -> 'explicit sard.var12 test'
					jsContent = jsContent.replace(new RegExp('([=(:w\\s]\\s*)'+oldVarName+'(?=[\\.(])','g'), '$1'+newVarName);
				}
				
				
			})
			
			dep.required.forEach(function(req)
			{
				var reqNamespace = used[req.path];

				if(reqNamespace == undefined)
				{
					return console.error('Unable to fetch module %s', req.path);
				}

				jsContent = jsContent.replace(req.match, reqNamespace);
				
				
				
			});
			
			
			buffer = buffer + '\n' + jsContent;
		});
		
		callback(buffer);
	}	


	var scanner = {
		test: function(sources)
		{
			return lstat(sources[0]) && sources.join('::').indexOf('.js') > -1;
		},
		scan: function(scripts, callback)
		{
			var deps = { used: {}, required: [] },
			q = new Queue(true);


			scripts.forEach(function(script)
			{
				if(script.indexOf('.js') == -1) return;

				q.add(function()
				{
					scanDeps(script, deps, function()
					{
						q.next();
					})
				})
			})

			q.add(function()
			{
				callback(deps.required);
			})

		},
		combine: function(required)
		{
			//don't pollute the global namespace.
			var buffer = 'var sard = {} ',
			used = {};

			required.forEach(function(dep, index)
			{

				var jsContent = fs.readFileSync(dep.path,'utf8'),
				namespace = 'sard.module' + index;

				used[dep.path] = namespace;

				jsContent = namespace + ' = {}; \n' + jsContent;

				jsContent = jsContent.replace(/exports/g, namespace);
				
				dep.required.forEach(function(req)
				{
					var reqNamespace = used[req.path];

					if(reqNamespace == undefined)
					{
						return console.error('Unable to fetch module %s', req.path);
					}

					jsContent = jsContent.replace(req.match, reqNamespace);
				})

				buffer = buffer + '\n' + jsContent;
			});

			return buffer;
		}	

	}

	function includeScript(cwd, source, scanned, callback)
	{
		var ns = source;
		
		//relative path
		if(ns.substr(0,1) == '.')
		{
			ns = cwd + '/' + source;
		}
		
		if(!!(ns = resolve(ns)) || !!(ns = resolve(cwd + '/' + source)))
		{
			return scanDeps(ns, scanned, callback);
		}
		
		return callback(null)

	}
	

	function scanDeps(sourceFile, scanned, callback)
	{
		if(scanned.used[sourceFile]) return callback( { path: sourceFile } );



		try
		{
			var data = fs.readFileSync(sourceFile.toString(),'utf8'),
			cwd = path.dirname(sourceFile);
		}
		catch(e)
		{
			//probably a std library item
			return callback(null);
		}
		//npm?
		if(data.search(/from\s*=\s*"\.\/(..\/)*\.npm/) > -1)
		{
			sourceFile = data.match(/from\s=\s"(.*?)"/)[1];

			sourceFile = require.resolve(cwd + '/' + sourceFile);
			
			
			//get the REAL path from NPM.
			return scanDeps(sourceFile, scanned, callback);
		}

		var required = (data.match(requireRegexp) || []),
		// var required = (data.match(/require\(.*?\)/g) || []),
		nRunning = required.length;


		scanned.used[sourceFile] = 1;

		var info = { path: sourceFile, required: [] };


		function next(skip)
		{
			if(skip || !(--nRunning))
			{
				scanned.required.push(info);
				return callback(info);
			}
		}

		if(!nRunning) return next(true);

		required.forEach(function(required)
		{
			var reqFile = required.match(/require\((.*?)\)/)[1],
			varName = required.match(/(\w+)\s*\=\s*require/);

			// console.log(required.match(/require\(.*?\)/))
			var reqInfo = { match: required.match(/require\(.*?\)/)[0], varName: varName ? varName[1] : undefined };


			try
			{
				reqFile = eval(reqFile);
			}
			catch(e)
			{
				console.error('Unable to include required file "%s" in %s due to the following error:', reqFile, sourceFile);
				console.error('-----------------------------------------');
				console.error(e.message)
				console.error('-----------------------------------------');
				return next();
			}


			includeScript(cwd, reqFile, scanned, function(inf)
			{
				if(inf)
				{
					//need to fix the path for NPM
					reqInfo.path = inf.path;
					info.required.push(reqInfo);
				}
				else
				{
					console.error('required file %s does not exist in %s', reqFile, sourceFile);
				}

				next();
			});


		})
	}
	
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
				
			mediator.pull('sard.scan',input, function(result)
			{
				combineScripts(required = (result.data.result || []), function(combined)
				{
					fs.writeFileSync(output, combined);
					
					if(ops.watch) watch();
					if(callback) callback();
				});
			});
			
		}
	}
	
	function getPackager(pull)
	{
		pull.callback(packager);
	}

	function getScanner(pull)
	{
		pull.callback(scanner);
	}

	mediator.on({
		'pull sard.scanner': getScanner,
		'pull sard.packager': getPackager
	})
}