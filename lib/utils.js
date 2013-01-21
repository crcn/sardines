var path = require('path'),
fs       = require('fs'),
path     = require('path'),
step     = require('stepc'),
outcome  = require('outcome'),
async    = require('async'),
resolve  = require('resolve'),
crc32    = require('crc32');

var cachedPackages = {};

/**
 * finds the package of a given module
 */

exports.findPackagePath = function(dir) {
	
	var found = null;

	return exports.eachDir(dir, function(dir) {
		try {
			
			var pkgPath = dir + "/package.json"

			//throws error
			fs.lstatSync(pkgPath);
			
			return pkgPath;

		} catch(e) {
			
		}
	});
	
	return found;
}

/**
 */

exports.loadPackage = function(pkgPath) {
	return cachedPackages[pkgPath] || (cachedPackages[pkgPath] = JSON.parse(fs.readFileSync(pkgPath, "utf8")));
}

/**
 */

exports.mainScriptPath = function(pkgPath) {
	var pkg = exports.loadPackage(pkgPath);
	var mainScript = path.normalize(path.dirname(pkgPath) + "/" + pkg.main);

	try {
		return require.resolve(mainScript);
	} catch(e) {
		return null;
	}
}


/**
 */

exports.eachDir = function(dir, each) {
	
	pathParts = dir.split('/');
	var result;
	while(pathParts.length) {
		if((result = each(pathParts.join("/"))) !== undefined) return result;
		pathParts.pop();
	}
}

/**
 */

exports.isMain = function(scriptPath, pkgPath) {
	return require.resolve(scriptPath) == exports.mainScriptPath(pkgPath);
}


/**
 */

exports.findFiles = function(file, search, onFile, onEnd) {

	var seen = {}, on = outcome.error(onEnd);

	function scanFile(file, callback) {

		step(
			function() {
				fs.lstat(file, on.success(this));
			},
			function(stat) {

				if(stat.isDirectory()) {
					return scanDir(file, callback);	
				}
				
				if(!search.test(file)) return callback();

				onFile(file);
				this();
			},
			function() {
				callback();
			}
		)
	}

	function scanDir(dir, callback) {

		//already scanned? prob symlink
		if(seen[dir]) return callback();

		seen[dir] = true;

		step(
			function() {
				fs.readdir(dir, on.success(this));
			},
			function(files) {

				var usable = [];

				for(var i = files.length; i--;) {
					var file = files[i];

					if(file.substr(0, 1) == '.') continue;

					usable.push(path.normalize(dir + "/" + file));
				}

				async.forEach(usable, scanFile, this);
			},
			function() {
				callback();
			}
		)
	}

	//entry point.
	scanFile(file, onEnd);



}


function exists(file) {
	try {
		return !!fs.lstatSync(file);
	} catch(e) {
		return false;
	}
}

var modulePath = exports.modulePath = function(script) {
	return 'modules/' + (script.moduleName || crc32(script.pkgPath));
}

/**
 * gets info about the given js file - core module? third-party? relative?
 */

exports.getPathInfo = function(required, cwd) {

	try {

		
		var coreModulePath = __dirname + "/builtin/" + required + ".js",
		isModule = required.substr(0,1) != '.';

		var ret = {
			stmt: required,
			module: isModule
		};

		if(isModule && exists(coreModulePath)) {

			ret.core = true;
			ret.moduleName = required;
			ret.pathFromPkg = '.';
			ret.module = true;
			ret.path = coreModulePath;

		} else {

			var realPath = resolvePath(required, cwd),
			pkgPath      = exports.findPackagePath(path.dirname(realPath)),
			bp = browserifyPath(pkgPath),
			name         = pkgPath ? getPackageName(pkgPath) : null,
			im           = pkgPath ? exports.isMain(realPath, pkgPath) : pkgPath;

			if(im && bp) {
				realPath = bp;
			}

			ret.path        = realPath;
			ret.moduleName  = name;
			ret.pkgPath     = pkgPath;
			ret.isMain      = !!im;
			ret.pathFromPkg = (realPath || '').replace(path.dirname(pkgPath), ".");

		}

		//alias to the given script - used as UID
		ret.alias = ret.pathFromPkg.replace('.', modulePath(ret));
		
 		return ret;

	} catch(e) {
		console.error('cannot load "%s" in "%s"', required, cwd);

		//something went wront
		return {
			stmt: required,
			error: e
		};
	}
}


/**
 * RELATIVE require.resolve to cwd since we might
 * be going into module dirs - we want to find relative modules to modules...
 */

function resolvePath(module, cwd) {

	
	return resolve.sync(module, {
		basedir: cwd
	});

	if(cwd && module.substr(0, 1) == ".") {
		return require.resolve(cwd + "/" + module);
	}

	//not local?
	try {
		return require.resolve(module);
	} catch(e) {
		return null;
	}
	

}


function browserifyPath(pkgPath) {
	try {
		var pkg = exports.loadPackage(pkgPath);

		var browserifyPath = pkg.sardines || pkg.browserify;
		return browserifyPath ? path.dirname(pkgPath) + "/" + browserifyPath : null;
	} catch(e) {
		return null;
	}
}


/**
 * returns the package name
 */

var getPackageName = module.exports.getPackageName = function(pkgPath) {
	try {
		return exports.loadPackage(pkgPath).name;
	} catch(e) {
		return null;
	}
}