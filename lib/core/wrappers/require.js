var _sardines = (function()
{
	var paths = { '':1 }, nodeRequire = typeof require == 'undefined' ? function(){} : require;
	
	var register = function(path, moduleFactory)
	{
		_sardines.moduleFactories[path] = moduleFactory,
		dir = dirname(path),
		modulePaths = dir.split('node_modules');
		
		for(var i = 0, n = modulePaths.length; i < n; i++)
		{
			var cpath = [cpath, modulePaths[i], 'node_modules'].join('/').replace(/\/+/g,'/');
			
			paths[cpath] = 1;
		}
		
		return moduleFactory;
	}

	var dirname = function(path)
	{
		var pathParts = path.split('/');
		pathParts.pop();
		return pathParts.join('/');
	}
	
	var moduleDoesntExist = function(path)
	{
		throw new Error('Module '+ path + ' does not exist');
	}

	var req = function(path, cwd)
	{
		var fullPath = req.resolve(path, cwd || '/');

		if(_sardines.modules[fullPath]) return _sardines.modules[fullPath];

		var factory = _sardines.moduleFactories[fullPath];

		if(!factory)
		{
			//could be a core function - try it.
			if(typeof require != 'undefined') return nodeRequire(path);
			
			moduleDoesntExist(fullPath);
		}

		var module = { exports: { } };

		var cwd = fullPath.match(/\.js$/) ? dirname(fullPath) : fullPath,
		modRequire = function(path)
		{
			return req(path, cwd);
		}
		
		modRequire.resolve = req.resolve;
		
		factory(modRequire, module, module.exports, cwd, fullPath);

		return _sardines.modules[fullPath] = module.exports;
	}

	//turns user//local/../../bin/./path to bin/path
	function normalizePath(path)
	{
		var pathParts = path.split(/\/+/g);

		for(var i = 0, n = pathParts.length; i < n; i++)
		{
			var part = pathParts[i];

			if(part == '..')
			{
				pathParts.splice(i - 1, 2);
				i-=2;
			}
			else
			if(part == '.')
			{
				pathParts.splice(i, 1);
				i--;
			}
		}


		return pathParts.join('/')
	}

	function relateToAbsPath(path, cwd)
	{
		//root
		if(path.substr(0, 1) == '/') return path;
		
		//relative
		if(path.substr(0, 1) == '.') return cwd + '/' + path;

		return path;
	}

	function findModulePath(path)
	{
		var tryPaths = [path, path + '/index.js', path + '.js'];
		
		
		for(var requirePath in paths)
		{
			for(var i = tryPaths.length; i--;)
			{
				var fullPath = normalizePath(requirePath+'/'+tryPaths[i]);
				
				
				if(_sardines.moduleFactories[fullPath]) return fullPath;
			}
		}		
	}

	req.resolve = function(path, cwd)
	{
		return findModulePath(normalizePath(relateToAbsPath(path, cwd))) || nodeRequire.resolve(path);
	}
	
	return {
		moduleFactories: { },
		modules: { },
		require: req,
		register: register
	}
})();