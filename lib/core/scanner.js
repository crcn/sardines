var detective = require('detective'),
	path = require('path'),
	sys = require('sys'),
	fs = require('fs'),
	resolve = require('resolve'),
	mu = require('./utils/mu');



function includeDeps(path, requirePaths)
{
	var parts = path.split('/');


	//ugly as shit, but it works :/
	while(parts.length)
	{
		parts.pop();
		var modulesDir = parts.join('/') + '/node_modules';

		try
		{
			fs.statSync(modulesDir);
			
			requirePaths[modulesDir] = 1;
			//require.paths.unshift(modulesDir);
			break;
		}catch(e)
		{
		}

	}
}

function exists(source)
{
	try
	{
		return fs.lstatSync(source);
	}
	catch(e)
	{
		
	}
}

function findPackage(source)
{
	var dir = path.dirname(source).split('/');
	
	while(dir.length)
	{
		var cdir = dir.join('/'),
		pkg = cdir + '/package.json';
		
		if(exists(pkg))
		{
			var main = JSON.parse(fs.readFileSync(pkg)).main;
			
			
			if(main && require.resolve(cdir+'/'+main) == source) return pkg;
			return null;
		}
		
		dir.pop();
	}
	
	return null;
}

function tryResolve(source, requirePaths)
{
	try
	{
		var coreModule = __dirname + '/../builtins/' + source + '.js';
		
		if(exists(coreModule))
		{
			return { path: require.resolve(coreModule), name: '/node_modules/'+source };
		}
		
		//fuck updates for 0.6.0 removing require.paths
		for(var requirePath in requirePaths)
		{
			try
			{
				var path = require.resolve(requirePath + '/' + source);
				break;
			} catch (e)
			{
			}
		}
		
		if(!path)
		{
			return null;
		}

		//include the dependencies for the 
		includeDeps(path, requirePaths);
		
		return { path: path, name: path };
	}
	catch(e)
	{
		return null;
	}
}



function loadRegisterModule(mops)
{
	return mu.load(mops, __dirname + '/wrappers/registerModule.js')
}

function getRequired(src)
{
	var req = [];
	
	//for speed...
	(src.match(/require\(["'].*?["']\)/g) || []).forEach(function(required)
	{
		req.push(required.match(/\(["'](.*?)["']\)/)[1]);
	})
	
	return req;
}


function substrNodeModules(path)
{
	var modIndex = path.lastIndexOf('/node_modules');
	
	
	return path;//return modIndex > -1 ? path.substr(modIndex) : path;
}


function includeDependencies(sourcePathOrOps, incOps, isEntry)
{
	var ops = {};
	
	if(typeof sourcePathOrOps == 'string')
	{
		ops.path = sourcePathOrOps;
	}
	else
	{
		ops = sourcePathOrOps;
	}
	
	ops.path = require.resolve(ops.path);
	
	
	// var isEntry = !incOps.cache;                           

	// if(!incOps.cache) callbacks.cache = { used: {}, required: [], paths: {}, requirePaths: { '':1 } };
	
	if(incOps.used[ops.path]) return incOps.used[ops.path];
	
	// if(!callbacks.moduleCount) callbacks.moduleCount = 0;
	// callbacks.moduleCount++;
                                      
	
	var depInfo = incOps.used[ops.path] = { path: ops.path, name: ops.name || ops.path },
		cwd = path.dirname(ops.path);          
   

	var requirePaths = [],
		required = [];
		
	var src = fs.readFileSync(ops.path,'utf8');
	var required = getRequired(src);//detective(src);
	
	
	//e.g: require('fs'); require('daisy');
	
	
	/*if(ops.module)
	{
		var index = depInfo.name.indexOf(ops.module);
		
		if(index > -1) depInfo.name = '/node_modules/' + depInfo.name.substr(index);
	}*/
	
	depInfo.name = substrNodeModules(depInfo.name);
	
	
	
	required.forEach(function(dep)
	{
		//relative path?
		if(dep.substr(0,1) == '.')
		{
			dep = cwd + '/' + dep;
		}

		var newDep = dep;
		
		
		if(!(newDep = tryResolve(dep, incOps.requirePaths)) && !(newDep = tryResolve(cwd+'/'+dep)))
		{
			console.error('Cannot include %s', dep);
			return;
			// return incOps.error({ path: dep, source: ops.path });
		}    

		//dep is an NPM module
		else
		{                          
			//super duper important. If a dependency is a node_module, the node module may come from different places, which 
			//would include the script multiple times >.> 
			dep = incOps.paths[dep] = incOps.paths[dep] || newDep.path;
		}
		
		
		info = includeDependencies({ path: dep, name: newDep.name, module: ops.module }, incOps);
	});
	
	
	if(depInfo.name.substr(0,1) != '/')
	{
		depInfo.name =  '/node_modules/'+depInfo.name;//.match(/\w+/g)[0];
	}
	
	var mops = { path: ops.path, 
		name: depInfo.name,
		body: src
	};
	
	var pkg = findPackage(ops.path);
	
	if(pkg)
	{
		// var depDir
		
		// var main = require.resolve(JSON.parse(fs.readFileSync(newDep.pkg,'utf8')).main) ;
		
		var pmops = {
			name: substrNodeModules(path.dirname(pkg)),
			body: 'module.exports = require("'+depInfo.name+'")'
		}
		

		incOps.write(loadRegisterModule(pmops));
	}
	
	
	//if(src.indexOf('\'linkChild\'') > -1) console.log(sourcePath)
	
	incOps.write(loadRegisterModule(mops));

	if(isEntry)
	{
		incOps.end(depInfo);
	}

	return depInfo;
}

function include2(sourceFile, op, callbacks)
{                        
	
	//blarrrg this is ugly - but we need to check if require exists. (lightly before the heavy stuff)
	var content = fs.readFileSync(sourceFile,'utf8');
	
	if(!content.match(/require\(/))
	{                         
		callbacks.write(content);              
		return callbacks.end();
	}                                      
	
	//console.log('combining %s', sourceFile);
	
	scanDeps(sourceFile, {
		error: function(ops)
		{
			var fparts = sourceFile.split('/');
			
			console.warn('cannot include %s in %s', ops.path, ops.source/*fparts.splice(fparts.length-2,2).join('/')*/);
		},
		require: function(ops)
		{
		},
		write: callbacks.write,
		end: function(depInfo)
		{
			console.log('done combining %s', sourceFile);
			callbacks.end(depInfo.path);
		}
	});
}

function combineJs(ops, callbacks)
{
	var sourceFiles = ops.input,
	include = ops.include;

	var numRunning = sourceFiles.length,
	entries = [],
	incOps = {
		used: {}, 
		required: [], 
		paths: {}, 
		requirePaths: { '':1 },
		error: callbacks.error,
		write: callbacks.write,
		end: function(entry)
		{
			entries.push(entry.name);
			
			if(!(--numRunning)) callbacks.end(entries);	
		}
	};
	
	
	include.forEach(function(incOrModule)
	{
		var inc = {};
		
		if(typeof incOrModule == 'string')
		{
			inc.path = inc.name = require.resolve(incOrModule);
		}
		else
		{
			inc = incOrModule;
		}
		
		//inc.module = inc.name;
		
		includeDependencies(inc, incOps);
	});
	
 
	if(!numRunning) return callbacks.end();

	sourceFiles.forEach(function(sourceFile)
	{
		includeDependencies(sourceFile, incOps, true);
	})
		
}

// exports.scanDeps = scanDeps;
exports.combineJs = combineJs;                           


