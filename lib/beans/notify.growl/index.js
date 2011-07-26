var growl = require('growl');

exports.plugin = function(mediator)
{
	function notify(data)
	{
		console.success(data.message);
		growl.notify(data.message, { title: data.title || 'Sardines', image: __dirname + '/icons/node_info.png' });
	}
	
	mediator.on({
		'push notify/user': notify 
	})
}