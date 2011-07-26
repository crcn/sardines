var vine = require('vine'),
	fs = require('fs');

exports.plugin = function(mediator)
{
	var scanners = [];
	
	function init()
	{
		mediator.on({
			'push -pull -multi sard/scanner': function(scanner)
			{
				scanners.push(scanner);
			}
		})
	}
	
	function exists(pull, success)
	{
		var sources = pull.data instanceof Array ? pull.data : [pull.data];
		
		
		for(var i = sources.length; i--;)
		{
			var source = sources[i];
			
			try
			{
				var source = fs.realpathSync(ops.path);
			} 
			catch(e)
			{
				sources.split(i, 1);
				console.error('The path %s does not exist', source);
			}
		}
		
		for(var i = scanners.length; i--;)
		{
			var scanner = scanners[i];
			
			if(scanner.test(sources)) break;
		}
		
		if(i == -1) return pull.end(vine.error('Unable to handle sources: %s', sources.join(',')));
		
		success(scanner, sources);
	}
	
	function scan(pull)
	{
		exists(pull, function(scanner, sources)
		{
			scanner.scan(sources, function(files)
			{
				pull.end(vine.result(files))
			});
		});
	}
	
	function combine(pull)
	{
		exists(pull, function(scanner, sources)
		{
			scanner.scan(sources, function(files)
			{
				pull.end(vine.result(scanner.combine(files)));
			});
		});
	}
	
	mediator.on({
		'push init': init,
		'pull sard/scan': scan,
		'pull sard/combine': combine
	})
}