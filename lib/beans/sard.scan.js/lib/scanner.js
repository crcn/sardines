var aster = require('aster'),
	path = require('path'),
	sys = require('sys');

function tryResolve(source)
{
	try
	{
		return require.resolve(source);
	}
	catch(e)
	{
		return null;
	}
}


function scanDeps(sourcePath, callbacks)
{
	var isRoot = !callbacks.cache;

	if(!callbacks.end) callbacks.end     = function(){};
	if(!callbacks.next) callbacks.next   = function(){};
	if(!callbacks.error) callbacks.error = function(){};
	if(!callbacks.cache) callbacks.cache = { used: {}, required: [] };
	if(callbacks.cache.used[sourcePath]) return callbacks.cache.used[sourcePath];

	
	var depInfo = callbacks.cache.used[sourcePath] = { path: sourcePath },
		cwd = path.dirname(sourcePath); 

	try
	{
		var ast = aster.load(sourcePath);
	}
	catch(e)
	{
		// console.log(e.stack)
		return;
	}

	//npm package?
	if(sourcePath.match(/\/.*?@.*?\//))
	{
		var realPath = ast.walk({
			'var': function(walker)
			{
				var value = walker.values[0];

				if(value && value.name == 'from')
				{
					return value.value.walk({
						'string': function(walker)
						{
							return walker.value;
						}
					})
				}
			}
		});

		//get the actual path info
		var ret = scanDeps(require.resolve(cwd + '/' + realPath), callbacks);

		//since this is cached, we need to rpeplace i
		depInfo.path = ret.path;


		return ret;
	}

	var requirePaths = [],
		required = [];


	//find all require.paths.unshift(...)
	ast.walk({
		'call': function(walker)
		{
			// console.log(walker.reference)
			var ref = walker.reference;

			if(walker.name == 'require')
			{
				if(ref.chain && ref.chain[1] == 'paths' && (ref.chain[2] || '').match(/push|unshift/g))
				{
					requirePaths.push(walker);
				}
				else
				{
					required.push(walker);
				}			
			}
		}
	});

	requirePaths.forEach(function(path)
	{
		try
		{
			eval(path.toString().replace('__dirname',"'"+cwd+"'"));
		}
		catch(e)
		{
			console.log(e);
		}
	});


	required.forEach(function(req)
	{
		var dep = req.walk({
			'string': function(walker)
			{
				return walker.value;
			}
		}) || '';

		//relative path?
		if(dep.substr(0,1) == '.')
		{
			dep = cwd + '/' + dep;
		}

		var newDep = dep;

		if(!(newDep = tryResolve(dep)) && !(newDep = tryResolve(cwd+'/'+dep)))
		{
			return callbacks.error({ path: dep, source: sourcePath });
		}
		else
		{
			dep = newDep;
		}

		if(info = scanDeps(dep, callbacks))
		{
			callbacks.require({ path: info.path, source: sourcePath, ast: req, info: info });
		}
	});



	callbacks.next({ path: sourcePath, ast: ast });

	if(isRoot)
	{
		callbacks.end();
	}

	return depInfo;
}

function combineSource(sourceFile, op, callbacks)
{
	console.ok('combining %s', sourceFile);
	
	scanDeps(sourceFile, {
		error: function(ops)
		{
			var fparts = sourceFile.split('/');

			console.warn('cannot include %s in %s', ops.path, sourceFile/*fparts.splice(fparts.length-2,2).join('/')*/);
		},
		require: function(ops)
		{
			var ast = ops.ast,
			varName = 'sardVar' + (op.index++),
			moduleName = op.used[ops.path];


			if(!op.replace[ops.source])
			{
				op.replace[ops.source] = {};
				if(callbacks.require) callbacks.require(ops.source);
			}

			if(ast.assignedTo)
			{
				ast.assignedTo.references().forEach(function(vr)
				{ 
					try
					{
						if(vr.replaceName)
						vr.replaceName(varName);
					}
					catch(e)
					{
						console.error(varName);
						throw e;
					}
				});

				ast.assignedTo.replaceName(varName);
			}

			op.replace[ops.source][ast.toString()] = moduleName;	
		},
		next: function(ops)
		{
			var moduleName = 'sardModule' + (op.index++);

			op.used[ops.path] = moduleName;

			var script = ops.ast.toString().replace(/(module\.)?exports(?=[^\w])/g,moduleName);
				required = op.replace[ops.path];

			for(var rep in required)
			{
				script = script.replace(rep,required[rep]);
			}

			callbacks.write('var '+moduleName + ' = {}; \n'+script + '\n');
		},
		end: function()
		{
			console.success('done combining %s', sourceFile);
			callbacks.end();
		}
	});
}

function combineJs(sourceFiles, callbacks)
{
	if(!(sourceFiles instanceof Array)) sourceFiles = [sourceFiles];


	var numRunning = sourceFiles.length;
 
	if(!numRunning) return callbacks.end();

	sourceFiles.forEach(function(sourceFile)
	{
		combineSource(sourceFile, { used: {}, replace: {}, index: 0 }, {
			error: callbacks.error,
			require: callbacks.require,
			write: callbacks.write,
			end: function()
			{
				if(!(--numRunning)) callbacks.end();	
			}
		})
	})
		
}

exports.scanDeps = scanDeps;
exports.combineJs = combineJs;                           


