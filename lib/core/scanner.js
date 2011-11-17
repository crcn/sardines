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
		if(resolve.isCore(source))
		{
			return require.resolve('builtins/' + source);
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

		//include the dependencies for the 
		includeDeps(path, requirePaths);
		return { path: path };
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


function scanDeps(sourcePath, callbacks)
{
	var isRoot = !callbacks.cache,
	nodeModuleIndex = sourcePath.indexOf('node_modules');                                 

	if(!callbacks.end) callbacks.end     = function(){};
	if(!callbacks.next) callbacks.next   = function(){};
	if(!callbacks.error) callbacks.error = function(){};
	if(!callbacks.cache) callbacks.cache = { used: {}, required: [], paths: {}, requirePaths: { '':1 } };
	
	if(callbacks.cache.used[sourcePath]) return callbacks.cache.used[sourcePath];
	
	if(!callbacks.moduleCount) callbacks.moduleCount = 0;
	callbacks.moduleCount++;
                                      
	// if(sourcePath.indexOf('beanpole') > -1) console.log(sourcePath);
	
	var depInfo = callbacks.cache.used[sourcePath] = { path: sourcePath, name: 'module' + callbacks.moduleCount  },
		cwd = path.dirname(sourcePath);          
   
	/*try
	{
		var ast = aster.load(sourcePath);
	}
	catch(e)
	{
		// console.log(e.stack)
		return;
	}*/

	//npm package?
	/*if(sourcePath.match(/\/.*?@.*?\//))
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
	}*/

	var requirePaths = [],
		required = [];


	//find all require.paths.unshift(...)
	/*ast.walk({
		'call': function(walker)
		{
			// console.log(walker.reference)
			var ref = walker.reference;
			
			if(walker.toString().indexOf('./lexer') > -1) console.log(walker.toString());
			
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
	});*/
	
	var src = fs.readFileSync(sourcePath,'utf8');
	var required = getRequired(src);//detective(src);

	/*requirePaths.forEach(function(path)
	{
		try
		{
			eval(path.toString().replace('__dirname',"'"+cwd+"'"));
		}
		catch(e)
		{
			console.log(e);
		}
	});*/
	
	
	required.forEach(function(dep)
	{
		//relative path?
		if(dep.substr(0,1) == '.')
		{
			dep = cwd + '/' + dep;
		}

		var newDep = dep,
		depInfo = callbacks.cache.used[newDep];
		
		if(!(newDep = tryResolve(dep, callbacks.cache.requirePaths)) && !(newDep = tryResolve(cwd+'/'+dep)))
		{
			return callbacks.error({ path: dep, source: sourcePath });
		}    

		//dep is an NPM module
		else
		{                          
			//super duper important. If a dependency is a node_module, the node module may come from different places, which 
			//would include the script multiple times >.> 
			dep = callbacks.cache.paths[dep] = callbacks.cache.paths[dep] || newDep.path;
		}
		
		
		
		

		
		if(info = scanDeps(dep, callbacks))
		{
			/*if(newDep.pkg)
			{
				// var depDir
				
				// var main = require.resolve(JSON.parse(fs.readFileSync(newDep.pkg,'utf8')).main) ;
				
				var mops = {
					name: path.dirname(newDep.pkg),
					body: 'module.exports = require("'+newDep.path+'")'
				}

				callbacks.write(loadRegisterModule(mops));
			}*/
			
			//replace the path with the new given name
			//walker.target[1] = dep;
		}
	});
	
	
	var mops = { path: sourcePath, 
		name: depInfo.path,
		body: src
	};
	
	var pkg = findPackage(sourcePath);
	
	if(pkg)
	{
		// var depDir
		
		// var main = require.resolve(JSON.parse(fs.readFileSync(newDep.pkg,'utf8')).main) ;
		
		var pmops = {
			name: path.dirname(pkg),
			body: 'module.exports = require("'+sourcePath+'")'
		}
		

		callbacks.write(loadRegisterModule(pmops));
	}
	
	callbacks.write(loadRegisterModule(mops));

	callbacks.next();

	if(isRoot)
	{
		callbacks.end(depInfo);
	}

	return depInfo;
}

function combineSource(sourceFile, op, callbacks)
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

function combineJs(sourceFiles, callbacks)
{
	if(!(sourceFiles instanceof Array)) sourceFiles = [sourceFiles];


	var numRunning = sourceFiles.length,
	entries = [];
 
	if(!numRunning) return callbacks.end();

	sourceFiles.forEach(function(sourceFile)
	{
		combineSource(sourceFile, { used: {}, replace: {}, index: 0 }, {
			error: callbacks.error,
			write: callbacks.write,
			end: function(entry)
			{
				entries.push(entry);
				
				if(!(--numRunning)) callbacks.end(entries);	
			}
		})
	})
		
}

exports.scanDeps = scanDeps;
exports.combineJs = combineJs;                           


