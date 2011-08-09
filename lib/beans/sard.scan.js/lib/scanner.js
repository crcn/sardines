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
		});

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

function combineJs(sourceFile, callbacks)
{
	var used = {},
	replace = {},
	buffer = '',
	index = 0;
	
	scanDeps(sourceFile, {
		error: function(ops)
		{
			var fparts = sourceFile.split('/');

			console.log('cannot include %s in %s', ops.path, fparts.splice(fparts.length-2,2).join('/'));
		},
		require: function(ops)
		{
			var ast = ops.ast,
			varName = 'sardVar' + (index++),
			moduleName = used[ops.path];

			if(!replace[ops.source]) replace[ops.source] = {};

			if(ast.assignedTo)
			{
				ast.assignedTo.references().forEach(function(vr)
				{ 
					vr.replaceName(varName);
				});

				ast.assignedTo.replaceName(varName);
			}

			replace[ops.source][ast.toString()] = moduleName;	
		},
		next: function(ops)
		{
			var moduleName = 'sardModule' + (index++);

			used[ops.path] = moduleName;

			var script = ops.ast.toString().replace(/(module\.)?exports(?=[^\w])/g,moduleName);
				required = replace[ops.path];

			for(var rep in required)
			{
				script = script.replace(rep,required[rep]);
			}

			callbacks.write('var '+moduleName + ' = {}; \n'+script + '\n');
		},
		end: function()
		{
			callbacks.end();
		}
	})	
}

exports.scanDeps = scanDeps;
exports.combineJs = combineJs;                           


