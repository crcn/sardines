exports.getCallbacks = function(callbacks)
{
	var cb = callbacks || {};
	
	if(typeof cb == 'function')
	{
		cb = {
			data: callbacks
		}
	}
	
	if(!cb.data) cb.data = function(){};
	if(!cb.error) cb.error = function(){};
	if(!cb.exit) cb.exit = function(){};
	
	return cb;
}

exports.listen = function(process, callbacks)
{
	var cb = exports.getCallbacks(callbacks);
	
	
	process.stdout.on('data', function(data)
	{
		cb.data(data.toString());
	})
	
	process.stderr.on('data', function(data)
	{
		cb.error(data.toString());
	})
	
	process.addListener('exit', function(code)
	{
		cb.exit(code);
	});	
}