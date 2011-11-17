var utils = require('../process/utils'),
spawn = require('child_process').spawn;

exports.ssh = function(config)
{
	return {
		config: config,
		exec: function(command, callback)
		{
			if(command instanceof Array)
			{
				command = command.join(' ');
			}
			
			if(!callback) callback = function(){ };
			
			var process = spawn('expect', [__dirname + '/ssh.exp', config.host, config.user, config.pass, 'PATH=$PATH:/usr/local/bin:/opt/local/bin;'+command]),
				self = this,
				ready = false,
				calledBack = false;
			
			var cb = utils.getCallbacks(callback),
				ret;
			
			
			
			utils.listen(process, {
				data: function(buffer)
				{
					if(ready)
					{
						var data = buffer.toString();
						
						if(data.match(/[\S]+/))
						{
							calledBack = true;
							cb.data(data);
						}
					}
					if(buffer.toString().toLowerCase().indexOf('password:') > -1)
					{
						ready = true;
					}
				},
				error: function(err)
				{
					cb.error(err)
				},
				exit: function(code)
				{
					cb.exit(code);
					if(!calledBack) cb.data(null);
				}
			})
			
			
			return {
				kill: function()
				{
					process.kill();
				}
			}
		}
	}
}
