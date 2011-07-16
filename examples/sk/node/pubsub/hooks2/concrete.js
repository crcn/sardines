var Structr = require('../../../core/struct').Structr,
uid = require('../../utils').uid,
ConcreteProxyController = require('../index').ConcreteProxyController,
Janitor = require('../../../core/garbage').Janitor,
Queue = require('../../../core/queue').Queue


var RemoteProxyController = Structr({
	'__construct': function(connection, mediator, onConnect)
	{
		this._connection = connection;
		this._cids = {};
		this._cid = 1;
		this.locked = [];
		this._q = new Queue(true);
		this._mediator = mediator;
		this._janitor = new Janitor();
		this._hid = uid();
		
		connection.addListener('data', this.getMethod('_onData'));
		connection.addListener('close', this._janitor.getMethod('dispose'))

		connection.addListener('connect', function()
		{
			if(onConnect) onConnect();
		})

		connection.addListener('error', function(e)
		{
			console.error(e)
		});
		
		this._janitor.addDisposable(this.bind('availableCalls', function(calls)
		{
			calls.forEach(function(call)
			{
				self._janitor.addDisposable(mediator.onRequest(call, function(data, callback)
				{
					if(self.locked.indexOf(call) == -1)
					{
						self.request(call, data, callback);
					}
				}));
			});
		}));
	},
	'call': function(name, data, callback)
	{
		this._write({
			type: 'call',
			name: name,
			data: data, 
			bound :true,
			callback: callback
		});
	},
	'change': function(name, data)
	{
		this._write({
			type: 'change',
			name: name,
			data: data
		});
	},
	'bind': function(name, data, callback)
	{
		this._write({
			type: 'bind',
			name: name,
			data: data, 
			bound: true,
			callback: callback
		});
	},
	'onRequest': function(name, callback)
	{
		this._write({
			type: 'onRequest',
			name: name,
			bound: true,
			callback: callback
		})
	},
	'onChange': function(name, callback)
	{
		this._write({
			type: 'onChange',
			name: name,
			bound: true,
			callback: callback
		})
	}, 
	'_write': function(ops)
	{
		if(!ops.callback && (typeof ops.data == 'function'))
		{
			ops.callback = ops.data;
			ops.data = undefined;
		}


		var cid = this._cid++,
		self = this;

		//timeout for N seconds, then delete the cid

		if(!ops.bound)
		var timeout = setTimeout(function()
		{
			delete self._cids[ cid ];
		}
		, 20000);

		this._cids[ cid ] = {
			finish: function()
			{
				if(ops.callback) ops.callback.apply(null, arguments);

				if(!ops.bound && (!ops.callback || !ops.callback.bound))
				{
					clearTimeout(timeout);
					delete self._cids[ cid ];
				}
			}
		}

		self._q.add(function()
		{
			setTimeout(function()
			{
				try
				{
					self._connection.write(JSON.stringify({ type: ops.type, name: ops.name, cid: cid, data: ops.data, hid: self._hid }));
					self._q.next();
				}
				catch(e)
				{
					console.error(e.stack)
				}
			},
			10);
		});
	},
	'final _onData': function(data)
	{
		try
		{
			var response = JSON.parse(data.toString());

			if(response.hid == this._hid)
			{
				var callback = this._cids[ response.cid ];

				if(callback)
				{
					callback.finish(response.data);
				}
			}
			else
			{
				this.handleRequest(response);
			}
		}
		catch(e)
		{
			console.error(e.stack);
		}
	},
	'handleRequest': function(response)
	{ 
		var method = this._mediator.getMethod(response.type),
		self = this;

		var callback = function(data)
		{
			self._q.add(function()
			{
				setTimeout(function()
				{
					try
					{
						self._connection.write(JSON.stringify({ cid: response.cid, hid: response.hid, data: data }));
						self._q.next();
					}
					catch(e)
					{
						console.error(e.stack)
					}
				},
				50)
			})
		}

		if(method)
		{
			if(!response.data)
			{
				response.data = callback;
			}


			this.locked.push(response.name);
			var ret = method(response.name, response.data, callback);
			this.locked.splice(this.locked.indexOf(response.name),1);
			if(ret)
			{
				self._janitor.addDisposable(ret);
			}
		}
	}
});

exports.RemoteProxyController = RemoteProxyController;