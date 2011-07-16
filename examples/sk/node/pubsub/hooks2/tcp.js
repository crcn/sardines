var Structr = require('../../../core/struct').Structr,
	net = require('net'),
	uid = require('../../utils').uid,
	ConcreteProxyController = require('../index').ConcreteProxyController,
	Janitor = require('../../../core/garbage').Janitor,
	Queue = require('../../../core/queue').Queue,
	RemoteProxyController = require('./concrete').RemoteProxyController;
	


var TCPProxyController = RemoteProxyController.extend({
	'override __construct': function(connection, mediator, onConnect)
	{
		connection.setEncoding('utf8');
		
		this._super(connection, mediator, onConnect);
	}
})


var ClientProxyController = TCPProxyController.extend({
	'override __construct': function(connection, mediator, onConnect)
	{
		this._super(connection, mediator, onConnect);
		
		var self = this;
		
		this._janitor.addDisposable(mediator.bind('availableCalls', function(calls)
		{
			calls.forEach(function(call)
			{
				self._janitor.addDisposable(mediator.onRequest(call, function(data, callback)
				{
					
					if(self.locked.indexOf(call) == -1)
					self.request(call, data, callback);
				}));				
			});
		}));
	}
});


var ServerProxyController = TCPProxyController.extend({
	'override __construct': function(connection, mediator, onConnect)
	{
		this._super(connection, mediator, onConnect);
		
		var self = this,
			initialized = false;
		
		this._janitor.addDisposable(this.bind('availableCalls', function(calls)
		{
			if(!initialized)
			{
				mediator.request('newClient', function(){});
			}
			
			calls.forEach(function(call)
			{
				self._janitor.addDisposable(mediator.onRequest(call, function(data, callback)
				{
					if(self.locked.indexOf(call) == -1)
					self.request(call, data, callback);
				}));
			});
			
			if(!initialized)
			{
				mediator.request('connected', function(){});
			}
			
			
			initialized = true;
		}));
		
		
	}
});



var HookClient = Structr({
	'__construct': function(mediator, host, port)
	{
		this._mediator = mediator;
		this._host = host;
		this._port = port;
		
		if(!port)
		{
			var hostParts = host.split(':');
			this._host = hostParts[0];
			this._port = Number(hostParts[1]);
		}
		
		
		var self = this;
	},
	
	'connect': function(onConnect)
	{
		this.close();
		
		var con = this._connection = net.createConnection(this._port, this._host)
		this._hook = new ClientProxyController(this._connection, this._mediator, onConnect);
	},
	
	'close': function()
	{
		if(this._connection) this._connection.end();
		this._connection = null;
	}
});

var HookServer = Structr({
	'__construct': function(port)
	{
		this._port = port;
	},
	'listen': function(onConnect)
	{
		this.close();
		
		var mediator = new ConcreteProxyController();
		
		var server = this._server = net.createServer(function(socket)
		{
			var controller = new ServerProxyController(socket, mediator, onConnect);
		});
		
		server.listen(this._port)
	},
	'close': function()
	{
		if(this._server) this._server.close();
		this._server = null;
	}
});

exports.Server = HookServer;
exports.Client = HookClient;