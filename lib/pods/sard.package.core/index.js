var sdutils = require('sdutils'),
	lstat = sdutils.lstat,
	fs = require('fs'),
	Queue = require('sk/core/queue').Queue,
	exec = require('child_process').exec,
	utils = require('sk/node/utils'),
	lazy = require('sk/core/lazy').lazy,
	WatchJanitor = sdutils.WatchJanitor;

exports.pod = function(mediator)
{
	var packagers = [];
	
	function init()
	{
		mediator.pull('sard.packager', function(packager)
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
		
			
		if(ops.watch)
		{
			// console.success('Watching %s for any changes', ops.input);
			
			watch = lazy.callback(function()
			{
				janitor.dispose();//BOOM. goodbye watches
				
			},500);
		}
		else
		{
			watch = function(){};
		}
		
		
		if(stat.isDirectory())
		{
			
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
						packageApp({ data: { input: inputFile, output: outputFile, watch: ops.watch, janitor: janitor }, callback: q.getMethod('next') });
					});
					
					return;
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
					
					
					if(i > -1)
					{
						packager.write({ input: inputFile, output: outputFile , watch: ops.watch, janitor: fj }, q.getMethod('next'));
					}
					else
					{
						exec('cp '+inputFile+' '+outputFile, q.getMethod('next'))
					}
					
					if(ops.watch)
					{
						fj = new WatchJanitor(inputFile);
						fj.watch(inputFile, write);
					}
				}
				
				q.add(write);
				
			})
		}
		
		q.add(pull.callback);
	}
	
	mediator.on({
		'push init': init,
		'pull sard.package': packageApp
	})
}