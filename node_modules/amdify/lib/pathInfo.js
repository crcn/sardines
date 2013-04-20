var path = require('path'),
fs       = require('fs'),
path     = require('path'),
step     = require('stepc'),
outcome  = require('outcome'),
async    = require('async'),
resolve  = require('resolve'),
crc32    = require('crc32');

module.exports = function(ops) {

  var self = { }, cachedPackages = {};


  /**
   */

  self.loadPackage = function(pkgPath) {
    return cachedPackages[pkgPath] || (cachedPackages[pkgPath] = JSON.parse(fs.readFileSync(pkgPath, "utf8")));
  }

  /**
   */

  self.mainScriptPath = function(pkgPath) {
    var mainScript = path.normalize(path.dirname(pkgPath) + "/" + self.loadPackage(pkgPath).main);

    try {
      return require.resolve(mainScript);
    } catch(e) {
      return null;
    }
  }


  /**
   */

  self.isMain = function(scriptPath, pkgPath) {
    return require.resolve(scriptPath) == self.mainScriptPath(pkgPath);
  }

  /**
   * gets info about the given js file - core module? third-party? relative?
   */



  self.getPathInfo = function(required, cwd) {


    try {

      
      var coreModulePath = __dirname + "/builtin/" + required + ".js",
      isModule = required.substr(0,1) != '.';

      var ret = {
        stmt: required,
        module: isModule,
      };

      ret.core = resolve.isCore(required);
      if(ret.core) {
        ret.moduleName = required;
      }

      if(isModule && exists(coreModulePath)) {

        ret.core = true;
        ret.moduleName = required;
        ret.pathFromPkg = './index.js';
        ret.module = true;
        ret.path = coreModulePath;
        ret.isMain = true;

      } else {


        var realPath = resolvePath(required, cwd),
        pkgPath      = self.findPackagePath(path.dirname(realPath)),
        name         = pkgPath ? getPackageName(pkgPath) : null,
        im           = pkgPath ? self.isMain(realPath, pkgPath) : pkgPath;

        ret.path        = browserifyPath(pkgPath) || realPath;
        ret.moduleName  = name || (ret.core ? required : undefined);
        ret.pkgPath     = pkgPath;
        ret.isMain      = !!im;
        ret.pathFromPkg = (realPath || '').replace(path.dirname(pkgPath), ".");

      }

      ret.baseDir = modulePath(ret);
      ret.relPath = required;

      //alias to the given script - used as UID
      ret.alias = path.normalize(ret.pathFromPkg.replace('.', ret.baseDir));



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

  /**
   * finds the package of a given module
   */

  self.findPackagePath = function(dir) {
    
    var found = null;

    return self.eachDir(dir, function(dir) {
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

  self.eachDir = function(dir, each) {
    
    pathParts = dir.split('/');
    var result;
    while(pathParts.length) {
      if((result = each(pathParts.join("/"))) !== undefined) return result;
      pathParts.pop();
    }
  }



  /**
   */

  self.findFiles = function(file, search, onFile, onEnd) {

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


  /**
   * returns the package name
   */

  var getPackageName = self.getPackageName = function(pkgPath) {
    try {
      return self.loadPackage(pkgPath).name;
    } catch(e) {
      return null;
    }
  }

  var modulePath = self.modulePath = function(script) {
    return (ops.prefix ? ops.prefix + "/" : "") + (script.moduleName || crc32(script.pkgPath));
  }


  function getPlatformMain(pkgPath) {
    var pkg = self.loadPackage(pkgPath),
    pform = pkg.platform || {};

    if(ops.platform == "browser") {
      return pkg.browserify || pform.browser || pkg.main;
    } else {
      return pform[ops.platform] || pkg.main;
    }
  }

  function getPlatformPath(pkgPath) {
    return path.dirname(pkgPath) + "/" + getPlatformMain(pkgPath);
  }



  function browserifyPath(pkgPath) {
    try {
      var browserifyPath = self.loadPackage(pkgPath).browserify;
      return browserifyPath ? path.dirname(pkgPath) + "/" + browserifyPath : null;
    } catch(e) {
      return null;
    }
  }

  return self;
}