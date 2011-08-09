var sdutils = require('sdutils'),
	lstat = sdutils.lstat,
	fs = require('fs'),
	Queue = require('sk/core/queue').Queue,
	exec = require('child_process').exec,
	utils = require('sk/node/utils'),
	lazy = require('sk/core/lazy').lazy,
	WatchJanitor = sdutils.WatchJanitor,
	wrench = require('wrench');

exports.plugin = function(mediator)
{
	var packagers = [];
	
	function init()
	{
		mediator.pull('-multi sard/packager', function(packager)
		{
			packagers.push(packager);
		});
	}
	
	function packageApp(pull)
	{
		var ops = pull.data;
		
		var stat = lstat(ops.input),
			q = new Queue(true),
			watch,
			janitor = new WatchJanitor(ops.input);
			
		
		if(ops.janitor)
		{
			ops.janitor.addChild(janitor);
		}
		
		
		if(stat.isDirectory())
		{
			if(ops.watch)
			{
				janitor.watch(ops.input, lazy.callback(function(cur, prev)
				{
					console.success('rebuilding dir %s', ops.input);
					
					janitor.dispose();
					
					packageApp({ data: ops });
				}, 500))
			}
			
			try
			{
				wrench.rmdirSyncRecursive(ops.output);
			}
			catch(e)
			{
				
			}
			
			utils.mkdir_r(ops.output);
						
			fs.readdirSync(ops.input).forEach(function(file)
			{
				if(file.substr(0,1) == '.') return;
				
				var inputFile = ops.input + '/' + file,
				outputFile = ops.output + '/' + file;
				
				var ostat = lstat(inputFile);
				
				if(ostat.isDirectory())
				{
					return q.add(function()
					{
						packageApp({ data: { input: inputFile, output: outputFile, watch: ops.watch, janitor: janitor }, end: q.getMethod('next') });
					});
					
				}
				
				var fj;
				
				function write()
				{
					if(fj) fj.dispose();
					
					for(var i = packagers.length; i--;)
					{
						var packager = packagers[i];

						if(packager.test(inputFile))
						{
							break;
						}
					}
					
					if(ops.watch)
					{
						fj = janitor.child(inputFile); 
						
						fj.watch(inputFile, function()
						{
							mediator.push('notify/user', { message: 'Processing '+outputFile.split('/').pop() });
							write();
						});
					}
					
					
					if(i > -1)
					{
						packager.write({ input: inputFile, output: outputFile , watch: ops.watch, janitor: fj }, function()
						{
							q.next();
						});
					}
					else
					{
						exec('cp '+inputFile+' '+outputFile, function()
						{
							q.next();
						})
					}
					
				}
				
				q.add(write);
				
			})
		}

		
		if(pull.end)
		{
			q.add(function()
			{
				pull.end();
			});
		}
	}
	
	mediator.on({
		'push init': init,
		'pull sard/package': packageApp
	})
}