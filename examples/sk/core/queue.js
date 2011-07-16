var sk = require('./events');

exports.Queue = {
	running:false,
	runNext:true,
	waiting:false,
	autoStart:false,
	'override __construct':function(autoStart)
	{
		this._super();
		this.autoStart = autoStart;
		this.stack = [];
	}
	,unshift:function(callback)
	{
		this.stack.unshift(callback);

		if(this.autoStart)
		this.start();
	},
	remove:function(callback)
	{
		var i = this.stack.indexOf(callback);
		if(i > -1)
		{
			this.stack.splice(i,1);
			return true;
		}
		return false;
	},
	add:function(callback)
	{
		this.stack.push(callback);

		if(!callback) throw new Error('callbacks cannot be undefined');

		if(this.autoStart)
		this.start();
	},
	start:function(force)
	{                         
		if((this.running || !this.runNext) && !force)
		return false;

		this.autoStart = true;

		if(!this.stack.length)
		{                           
			this.running = false;
			return this.emit('complete');
		}                         

		var callback = this.stack.shift();


		this.emit('cue',callback) 

		this.running = true;

		callback(this);
	},
	stop:function()
	{
		this.runNext = false;
	},
	next:function()
	{
		this.running = false;
		this.start();
	},
	clear:function()
	{
		this.stack = [];
	}             
} 

exports.Queue = sk.EventEmitter.extend(exports.Queue);


//executes items in batches
exports.BatchQueue = exports.Queue.extend({
	'override __construct': function (autoStart, max)
	{ 
		this.numRunning = 0;
		this._super(autoStart);
		this.max = max || 5;   
		var s = this;
 
		this.addListener('cue',function ()
		{                      
			s.numRunning++;
		})
	}
	,'override start':function ()
	{                     
		this._super(this.numRunning < this.max);
	},
	'override next': function ()
	{
		if(this.numRunning > 0)
			this.numRunning--;
		
		this._super();
	}
});

