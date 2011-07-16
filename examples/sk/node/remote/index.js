var Structr = require('.structr').Structr,
	Queue = require('../../core/queue').Queue,
	ssh = require('./ssh').ssh,
	scp = require('./scp').scp,
	processUtils = require('../process/utils'),
	fs = require('fs');



var Computer = function(config)
{
	var self = this,
		_ssh = ssh(config),
		_scp = scp(config),
		_q = new Queue(true);
	
	function q(func)
	{
		return function()
		{
			var args = [];
			
			for(var i = 0; i < arguments.length; i++)
			{
				args.push(arguments[i]);
			}
			
			var oldCallback = args.pop();
			
			if((typeof oldCallback != 'function') && !(oldCallback.data || oldCallback.error || oldCallback.exit))
			{
				args.push(oldCallback);
				oldCallback = function(){}
			}
			
			var oldCB = processUtils.getCallbacks(oldCallback);
			
			//add the new callback which queues the request
			
			var nexted = false;
			
			var cb = processUtils.getCallbacks({
				data: function(data)
				{
					oldCB.data(data);
				},
				error: function(err)
				{
					oldCB.error(err);
				},
				end: function(data)
				{
					cb.data(data);
					cb.exit();
				},
				exit: function(status)
				{
					if(!nexted)
					{
						oldCB.exit();
						_q.next();
					}
					
					nexted = true;
				}
			});
			
			
			args.push(cb)
			
			var pp;
			
			_q.add(function()
			{	
				pp = func.apply(null, args);	
			})
			
			return {
				kill: function()
				{
					if(pp)
					{
						pp.kill();
						cb.exit();
					}
				}
			}
		}
	}
	
	
	function _file(file)
	{
		return file.split('/').pop();
	}
	
	function _dirname(file)
	{
		var fileParts = file.split('/');
		fileParts.pop();
		return fileParts.join('/');
	}
	
	function log(data, color)
	{
		var lb = (data || '').split(/[\n\r]+/);
		
		for(var i = 0, n = lb.length; i < n; i++)
		{
			if(lb[i].match(/\S+/))
			console.log(config.host.blue+':'+lb[i][color]);
		}
	}
	
	function execScript(file, callback, getScript)
	{
		//where the script is gonna live temporarily
		var tmpDir = '/tmp/downloads-' + Math.round(Math.random()*999999),
			callback = processUtils.getCallbacks(callback);

		self.fs.mkdir(tmpDir, function()
		{
			var shellScript = tmpDir+'/'+_file(file);
			
			self.send(file, shellScript, function()
			{
				_ssh.exec(['cd',tmpDir,';',getScript(shellScript)], {
					data: function(data)
					{
						log(data,'yellow');
					},
					error: function(data)
					{
						log(data,'red');
					},
					exit: function()
					{
						console.success('finished %s', file);
						
						self.fs.remove(tmpDir, true, function()
						{
						});
						
						callback.data();
					}
				})
			});
		});
	}
	
	Structr.copy({
		send: q(_scp.send),
		exec: q(_ssh.exec),
		hasExec: function(bin, callback)
		{
			_ssh.exec('if  [ `which ' + bin + '` ]; then echo "1"; else echo "0"; fi;', function(result)
			{
				callback((result || '').indexOf('1') > -1)
			});
		},
		script: {
			shell: function(file, args, callback)
			{
				if(!callback)
				{
					callback = args;
					args = [];
				}
				
				execScript(file, callback, function(file)
				{
					return file +' '+ args.join(' ');
				});
			},
			js: function(file, args, callback)
			{
				
				if(!callback)
				{
					callback = args;
					args = [];
				}
				
				var jsPath = file;
				
				
				for(var i = 0; i < require.paths.length; i++)
				{
					try
					{
						var newPath = require.paths[i] + '/' + file;
						var stat = fs.lstatSync(newPath);
						jsPath = newPath;
					}
					catch(e)
					{
						
					}
				}
				
				//get the file name only
				args.unshift('./' + file.split('/').pop());
					
				execScript(jsPath, callback, function(file)
				{
					return 'node ' + args.join(' ');
				});
				
				
			}
		},
		fs : {
			exists: q(function(file, callback)
			{
				_ssh.exec('if  [ -a '+file+' ]; then echo "1"; else echo "0"; fi;', function(result)
				{
					callback.end((result || '').indexOf('1') > -1);
				});
			}),
			remove: q(function(file, recursive, callback)
			{
				if(!callback)
				{
					callback = recursive;
					recursive = false;
				}
				
				var args = ['rm'];
				
				if(recursive) args.push('-rf');
				
				args.push(file);
				
				_ssh.exec(args, callback);
			}),
			mkdir: q(function(dir, callback)
			{
				_ssh.exec('mkdir -p '+dir, callback);
			})
		}
	}, this);

}



exports.Computer = Computer;
