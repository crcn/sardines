var Structr = require('structr').Structr,
	spawn = require('child_process').spawn;


exports.Process = Structr({
	'__construct': function(binPath, args, ops)
	{
		if(binPath) this.open(binPath, args, ops);
	},
	'open': function(binPath, args, ops)
	{
		this.close();
		
		this._proc = spawn(binPath, args, ops);
		
		this._proc.stdout.on('data', this.getMethod('onData'));
		this._proc.stderr.on('data', this.getMethod('onError'));
		this._proc.on('exit', this.getMethod('onExit'));
		
		var self = this;
		
		this._proc.on('exit', function()
		{
			if(self._exitCallback) self._exitCallback();
		});
	},
	'close': function(callback)
	{
		this._exitCallback = callback;
		if(this._proc) this._proc.kill();
	},
	'write': function(data)
	{
		this._proc.stdin.write(data);
	},
	'onData': function(data)
	{
		//abstract
		process.stdout.write(data.toString(),'utf8');
	},
	'onError': function(data)
	{
		//abstract
		process.stdout.write(data.toString(),'utf8');
	},
	'onExit': function(data)
	{
		//abstract
	}
})