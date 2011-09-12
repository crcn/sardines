var beanpole = require('beanpole'),
router = beanpole.router();

require('sk/node/log')
	
require.paths.unshift(__dirname + '/libs');
require.paths.unshift(__dirname);

router.require(__dirname + '/beans').push('init');


exports.scan = function(file, callback)
{
	router.pull('one sard/scan', file, callback);
}

exports.combine = function(file, callback)
{
	router.pull('one sard/combine', file, callback);	
}

exports.package = function(ops, callback)
{
	if(ops.daemonize)
	{

		var beet = beanpole.router()
		beet.require(['hook.core','hook.http.mesh']).push('init');


		console.ok('Daemonizing, make sure you have beet installed');
		
		if(!ops.name) return console.error("A name must be provided before daemonizing".bold.underline);
		
		beet.on({
			'push -pull beet/ready': function()
			{
				//MUST watch for daemonizing
				if(ops.args.indexOf('-w') == -1)
				{
					ops.args.push('-w')
				}
				
				beet.pull('beet/add',{ path: __dirname + '/../bin/sardines', name: 'sardine-'+ ops.name, args: ops.args }, function(result)
				{
					if(result.message)
					{
						// console.success(result.message);
						console.success('Yippee! Now you don\'t have to worry about managing sardines for %s. Want to stop it?', ops.name);
						console.success('You have control by calling "beet start/stop/remove sardines-%s"'.underline, ops.name);
					}
					else
					(result.errors || result.warnings || []).forEach(function(msg)
					{
						console.warning(msg.message);
					});
					
					process.exit();
				});
			}
		});

	}
	else
	if(ops.input)
	{
		router.pull('sard/package', ops, function()
		{
			callback();
		})
	}
	else
	{
		callback();
	}
	
	
}