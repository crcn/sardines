var _sardines = (function()
{
	var nodeRequire, allFiles = {}, _moduleIndex = 0, _loadedScripts = {}, _loadQueue = [], _loadingScripts = false;

	var moduleDoesntExist = function(path) {
		throw new Error('Module '+ path + ' does not exist');
	}

	if(typeof window != 'undefined') {
		nodeRequire = function(path) {
			moduleDoesntExist(path);
		}
		nodeRequire.resolve = moduleDoesntExist;
	} else {
		nodeRequire = require;
	}

	/**
	 */

	function register(path, moduleFactory) {

		path = normalizePath(path);
		addPathToTree(path);

		_sardines.moduleFactories[path] = moduleFactory,
		dir = dirname(path);

		return moduleFactory;
	}

	/**
	 */

	function requireModule(path, cwd) {
		return requireWeb(path, cwd || "/") || nodeRequire(path);
	}

	/**
	 * 
	 */

	function requireWeb(path, cwd) {
		var fullPath = requireWeb.resolve(path, cwd);

		//already loaded the module?
		if(_sardines.modules[fullPath]) {
			return _sardines.modules[fullPath];
		}

		var factory = loadModuleFactory(fullPath);

		if(!factory) return null;

		var module = { exports: { } };

		var cwd = fullPath.match(/\.js$/) ? dirname(fullPath) : fullPath,
		modRequire = function(path) {
			return requireModule(path, cwd);
		},
		modResolve = function(path) {
			return requireWeb.resolve(path, cwd);
		}

		modRequire.resolve = modResolve;
		modRequire.paths = [];

		//load in the module
		factory(modRequire, module, module.exports, cwd, fullPath);

		return _sardines.modules[fullPath] = module.exports;
	}


		
	/**
	 * resolves the absolute path to a mudle
	 */

	requireWeb.resolve = function(path, cwd) {
		var absPath = normalizePath(relateToAbsPath(path, cwd));
		return findRegisteredModulePath(absPath) || nodeRequire.resolve(path);
	}


	/**
	 * finds a registered path (prod)
	 */

	function findRegisteredModulePath(path) {
		return findValueByPath(path, _sardines.moduleFactories) || findValueByPath(path, _sardines.modules);
	}


	/**
	 */

	function findValueByPath(path, dictionary) {
		var tryPaths = [path, path + '/index.js', path + '.js'],
		modulePaths = ['modules', ''];

		for(var j = modulePaths.length; j--;) {
			for(var i = tryPaths.length; i--;) {
				var fullPath = normalizePath('/'+modulePaths[j]+'/'+tryPaths[i]);
				if(dictionary[fullPath]) return fullPath;
			}
		}
	}


	/**
	 * loads a module factory either from a registered path, OR from the web (debugging)
	 */

	function loadModuleFactory(path) {
		return loadRegisteredModuleFactory(path);
	}

	/**
	 */

	function loadRegisteredModuleFactory(path) {
		return _sardines.moduleFactories[path];
	}

	/**
	 */

	function dirname(path)
	{
		var pathParts = path.split('/');
		pathParts.pop();
		return pathParts.join('/');
	}

	/**
	 */

	function normalizePath(path) {
		return normalizeArray(path.split("/"), false).join("/");
	}

	/**
	 */

	function relateToAbsPath(path, cwd) {
		if(path.substr(0, 1) == '/') return path; //root
		if(path.substr(0, 1) == '.') return cwd + '/' + path; //relative
		return path;
	}

	/**
	 */

	function normalizeArray(v, keepBlanks) {
		var L = v.length,
		dst = new Array(L),
		dsti = 0,
		i = 0,
		part, negatives = 0,
		isRelative = (L && v[0] !== '');
		for (; i < L; ++i) {
			part = v[i];
			if (part === '..') {
				if (dsti > 1) {
					--dsti;
				} else if (isRelative) {
					++negatives;
				} else {
					dst[0] = '';
				}
			} else if (part !== '.' && (dsti === 0 || keepBlanks || part !== '')) {
				dst[dsti++] = part;
			}
		}
		if (negatives) {
			dst[--negatives] = dst[dsti - 1];
			dsti = negatives + 1;
			while (negatives--) {
				dst[negatives] = '..';
			}
		}
		dst.length = dsti;
		return dst;
	}

	/**
	 */

	 function addPathToTree(path) {

		var curTree = allFiles, prevTree = allFiles,
		parts = path.split('/'),
		part;

		for(var i = 0, n = parts.length; i < n; i++) {
			part = parts[i];
			if(!curTree[part]) curTree[part] = { };
			curTree = curTree[part];
		}
	}
	

	return {

		/**
		 * path to where the javascript files are
		 */

		scriptsPath: "/",

		/**
		 * all the registered files 
		 */

		allFiles: allFiles,

		/**
		 * the registered module factories
		 */

		moduleFactories: { },

		/**
		 * the loaded modules
		 */

		modules: { },

		/**
		 * the require fn
		 */

		require: requireModule,


		/**
		 * registers a module
		 */

		register: register,

		/**
		 */

		dirname: dirname
	}
})();

