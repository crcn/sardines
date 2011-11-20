var EventEmitter = require('events').EventEmitter,
Structr = require('structr'),
fs = require('fs'),
path = require('path'),
mu = require('./utils/mu');




var isModule = function(path) {
	var firstChar = path.substr(0,1);
	return firstChar != '.' && firstChar != '/';
}

/**
 * wraps given module up 
 */

var wrapModule = function(ops) {
	//return body
	return mu.load(ops, __dirname + '/wrappers/registerModule.js');
}


/**
 */

var fileExists = function(file) {
	try {
		return !!fs.lstatSync(file);
	} catch(e) {
		return false;
	}
}

/**
 */

var nativeResolve = function(script) {
	try {
		var path = require.resolve(script);
		
		return path.substr(0,1) == '/' ? path : null;
	} catch(e) {
		return null;
	}
}

var packageDirs = {};

/**
 */

var containsPackage = function(dir) {
	
	var pkgPath = path.normalize(dir + '/package.json');
	
	return packageDirs[pkgPath] || (packageDirs[pkgPath] = fileExists(pkgPath));
}

/**
 */

var findLastPackageDir = function(path) {
	var root = [], pkgDir;

	path.split('/').forEach(function(part) {

		root.push(part);
		
		var path = root.join('/');
		
		if(containsPackage(path)) {
			pkgDir = path;
		}
	});
	
	return pkgDir;
}

/**
 */

var findPackageMainScript = function(path) {
	var dir = findLastPackageDir(path);
	
	if(dir) {
		var pkg = JSON.parse(fs.readFileSync(dir+'/package.json','utf8'));
		
		if(pkg.main) return require.resolve(dir+'/'+pkg.main);
	}
	
	return null;
}


var findModuleDir = function(script) {
	var dir = findLastPackageDir(script);
	
	if(!dir) return null;
	
	var dirParts = dir.split('/');
	dirParts.pop();
	return script.substr(dirParts.join('/').length+1);
}



/**
 */

var toModule = function(pt) {
	
	var moduleDir = findModuleDir(pt);
	
	if(!moduleDir) return null;
	
	return '/node_modules/' + moduleDir;
}

/**
 */

var combine = function(ops) {
	
	//already used scripts
	var cache = {
		
		//already included
		included: { },
		
		//paths to scan
		paths: { },
		
		//same module can be used in different projects - this makes sure it's from one...
		modules: { },
		
		packageDirs: {}
	},
	emitter = ops.emitter;
	
	
	
	
	
	/**
	 */
	
	var includePaths = function(path) {
		
		var nodeModulesDir = [];
		
		path.split('/').forEach(function(part) {
			nodeModulesDir.push(part);
			
			var dir = nodeModulesDir.join('/') + '/node_modules';
			
			if(cache.paths[dir]) return;
			
			if(fileExists(dir)) {
				cache.paths[dir] = 1;
			}
		});
		
	}

	/**
	 * resolves a path to a script
	 */

	var resolve = function(script) {

		//use the baked in resolver first
		var realpath;
 	
		if(realpath = nativeResolve(script)) return realpath;

		//overwise, scan other dirs
		for(var path in cache.paths) {
			
			if(realpath = nativeResolve(path + '/' + script)) return realpath;
		}

		return null;
	}


	var coreModulePath = function(path) {
		return resolve(__dirname + '/../builtins/' + path);
	}



	var getIncludeDetails = function(inc, origin) {
		

		var newPath,
		ret = {};

		if(newPath = coreModulePath(inc)) {
			
			ret = { script: newPath, alias: '/node_modules/' + inc, module: inc };
		} else if(isModule(inc)) {
			
			var moduleName = inc.split('/').shift(),
			newPath = resolve(inc);
			
			if(!newPath) return null;
			
			var modulePath = toModule(newPath);
			
			if(!modulePath) return null;
			
			
			ret = { script: newPath, alias: modulePath, module: moduleName, module: moduleName };
			
		//absolute path
		} else if(inc.substr(0,1) == '/') {
			
			
			//TODO: abs to relative
			ret = { script: inc, alias: inc };
			
		//relative
		} else {
			
			var script = resolve(origin.dir + '/' + inc);
			
			if(!script) return null;
			
			var normPath = path.normalize(inc.replace(/\.{1,2}\//g,'/')),
			relPath = path.normalize(origin.wrappedDir + '/' + inc),
			realInc = script.substr(script.lastIndexOf(normPath)),
			alias = relPath.substr(0,relPath.lastIndexOf(normPath)) + realInc;
			
			
			ret = { script: script, alias: alias };
		}
		
		
		
		ret.include = inc;
		
		
		
		return ret;
	}

	/**
	 * returns all the required dependencies in target
	 */

	var required = function(body, ops) {

		var includes = [];
		//where's this stuff being scraped from?
		var	origin = {
			dir: path.dirname(ops.script),
			wrappedDir: path.dirname(ops.alias)
		};
		

		//for speed
		(body.match(/require\(["'].*?["']\)/g) || []).forEach(function(req) {

			var path = req.match(/["'](.*?)["']/)[1],
			inc = getIncludeDetails(path, origin);
			
			
			if(!inc)
			{
				console.error('Cannot include: %s in %s'.red, req.bold, ops.script.bold);
				return;
			}
			
			includes.push(inc);
		});
		
		return includes;
	}




	/**
	 * recursively includes a script
	 */

	var include = function(ops) {

		var realpath = resolve(ops.script);
		
		if(!realpath)
		{
			console.error('cannot include %s', (ops.script || 'undefined').bold);
			return;
		}
		
		includePaths(realpath);
		
		//already included?
		if(cache.included[realpath] || cache.included[ops.alias]) return cache.included[realpath];

		var scriptInfo = cache.included[realpath] = cache.included[ops.alias] = { path: realpath };
		
		
		
		//the script content
		var content = fs.readFileSync(scriptInfo.path, 'utf8');
		
		var nodeModulesDir = path.dirname(realpath) + '/node_modules';
		

		//files to include
		required(content, ops).forEach(function(inc) {
			
			include(inc);
			// include({ script})
			
		});
		
		
		if(findPackageMainScript(ops.script) == ops.script) {
			
			var wrapped = wrapModule({
				path: '/node_modules/' + ops.module,
				content: 'module.exports = require("'+ops.alias+'")'
			});
			
			emitter.emit('data', wrapped);
		}
		
		

		var wrapped = wrapModule({
			path: ops.alias,
			content: content
		});

		emitter.emit('data', wrapped);
		
		if(ops.entry) ops.complete(ops.alias);
	}
	
	var numRunning = ops.entries.length,
	entries = [];
	
	ops.include.forEach(include);
	
	ops.entries.forEach(function(entry) {
		
		include({
			script: entry,
			alias: '/'+path.basename(entry),
			entry: true,
			complete: function(entry) {
				
				entries.push(entry);
				
				if(!(--numRunning)) emitter.emit('end', entries);
			}
		});
	});
}



module.exports = function(ops) {
	
	
	//emit write, and end
	var em = new EventEmitter();
	
	
	//return the combiner
	var combiner = {
		
		/**
		 * allows for the handler to listen for any buffered data to be returned 
		 */
		
		on: function(eventOrEvents, callback) {
			
			
			//easier way to add events: { event: callback, anotherEvent: callback };
			if(typeof eventOrEvents == 'object') {
				
				for(var event in eventOrEvents) {
					
					combiner.on(event, eventOrEvents[event]);
				}
				
				return;
			}
			
			em.addListener(eventOrEvents, callback);
		}
	};
	
	//initialize
	
	process.nextTick(function() {
		combine(Structr.copy(ops, { emitter: em }));
	});
	
	return combiner;
}



module.exports.findLastPackageDir = findLastPackageDir;
module.exports.toModule = toModule;