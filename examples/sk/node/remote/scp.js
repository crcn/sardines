var spawn = require('child_process').spawn,
path = require('path'),
utils = require('../process/utils');

exports.scp = function(sshOrConfig)
{
	var cfg = sshOrConfig.config || sshOrConfig;
	
	return {
		send: function(local, remote, callback)
		{
			if(!callback)
			{
				callback = remote;
				remote = local;
			}
			
			path.exists(local, function(exists)
			{
				if(exists)
				{
					var cb = utils.getCallbacks(callback);
					var process = spawn('expect', [__dirname + '/scp.exp', cfg.host, cfg.user, cfg.pass, local, remote]);
					utils.listen(process, {
						data: function(data)
						{
							// console.ok(data)
						},
						exit: function()
						{
							cb.data();
							cb.exit();
						}
					});
				}
				else
				{
					console.error('local file ":?" does not exist', local);
				}
			});
		}
	}
}