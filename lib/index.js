var beanpole = require('beanpole'),
	m = beanpole.mediator;
	
require.paths.unshift(__dirname + '/libs');

beanpole.require(['glue.core','glue.http']).require(__dirname + '/beans').push('init');


exports.scan = function(file, callback)
{
	m.pull('one sard/scan', file, callback);
}

exports.combine = function(file, callback)
{
	m.pull('one sard/combine', file, callback);	
}

exports.package = function(ops, callback)
{
	if(ops.daemonize)
	{
		console.ok('Daemonizing, make sure you have beet installed');
		
		if(!ops.name) return console.error("A name must be provided before daemonizing".bold.underline);
		
		m.on({
			'push -pull beet/ready': function()
			{
				//MUST watch for daemonizing
				if(ops.args.indexOf('-w') == -1)
				{
					ops.args.push('-w')
				}
				
				m.pull('beet/add',{ path: __dirname + '/../bin/sardines', name: 'sardine-'+ ops.name, args: ops.args }, function(result)
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
		m.pull('sard/package', ops, function()
		{
			callback();
		})
	}
	else
	{
		callback();
	}
	
	
}

// exports.combine(__dirname + '/../examples/sk/core/pubsub.js');