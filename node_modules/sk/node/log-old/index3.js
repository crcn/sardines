require('colors');

var EventEmitter = require('events').EventEmitter,
	lazyCallback = require('../../core/lazy').lazy.callback,
	fs = require('fs'),
	Queue = require('../../core/queue').Queue;

process.env.DEBUG_ALLSPICE = 'fatal|warning|error|message';

function setLogger(target, name, callback)
{
	if(process.env.DEBUG_ALLSPICE.toString().indexOf(name) > -1)
	{
		target[name] = function()
		{
			var msg = arguments[0];
			
			for(var i = 1, n = arguments.length; i < n; i++)
			{
				msg = msg.replace(':?', arguments[i]);
			}
			
			callback(msg);
		};
	}
	else
	{
		console[name] = function(){}
	}
}


function _loggerPartial(target, emit, type, colors)
{
	setLogger(target, type, function(m)
	{
		var colorized = m;
		
		for(var i = colors.length; i--;)
		{
			colorized = colorized[colors[i]];
		}
		
		console.log(colorized);
		
		emit(type, m);
	});
}

function init()
{
	
	
	
	setLogger('message', function(m)
	{
		console.log(m);
		
		emit('message', m);
	})
	
	setLogger('verbose',function(m)
	{
		console.log(String(m).blue);
		
		emit('verbose', m);
	});
	
	setLogger('error',function(m)
	{
		console.log(String(m).bold.red);
		
		// console.log(new Error().stack)
		
		emit('error', m);
	});
	
	setLogger('fatal',function(m)
	{
		console.log(String(m).bold.red);
		
		emit('fatal', m);
	});
	
	setLogger('warning',function(m)
	{
		console.log(String(m).yellow);
		
		emit('warning', m);
	});
	
	setLogger('notice',function(m)
	{
		console.log(String(m).grey);
		
		emit('notice', m);
	});
	
	setLogger('ok',function(m)
	{
		console.log(String(m).magenta);
		
		emit('ok', m);
	});
	
	setLogger('success',function(m)
	{
		console.log(String(m).green);
		emit('success', m);
	})
	
	setLogger('fail',function(m)
	{
		console.log(String(m).red);
		emit('fail', m);
	})
	
}

exports.on = em.addListener;


exports.logging = function(value)
{
	if(value) process.env.DEBUG_ALLSPICE = value;
	return process.env.DEBUG_ALLSPICE;
}

exports.verbose = function()
{
    process.env.VERBOSE += '|verbose';
    init();
}

exports.debug = exports.verbose = function()
{
    process.env.DEBUG_ALLSPICE += '|ok|notice|success';
    init();
}

exports.logger = function(ops)
{
	var target = ops.target,
		logPath = ops.logPath;
		
	var em = new EventEmitter(),
	logsToSave = {};

	var saveLogs = lazyCallback(function()
	{
		if(!exports.logPath) return;

		var logs = logsToSave;
		logsToSave = {},
		q = new Queue(true);


		function writeLogs(logType, stack)
		{
			var filePath = exports.logPath + '/' + logType + '.log';

			q.add(function()
			{
				//build up the log stack
				for(var i = stack.length; i--;)
				{
					var log = stack[i];

					buffer = log.createdAt.toString('ddd MMM d HH:mm:ss') + ' - ' + log.message + '\n' + buffer;
				}

				var ws = fs.createWriteStream(filePath, {'flags': 'a'});

				// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
				ws.write(buffer, function()
				{
					q.next();
					ws.end();
				});

				// fs.writeFile(filePath, buffer, q.getMethod('next'));
			});
		}

		for(var logType in logs)
		{
			var stack = logs[logType],
			buffer = '';

			writeLogs(logType, stack);
		}

	}, 
	500);

	function emit(type, message)
	{
		var log = { createdAt: new Date(), type: type, message: String(message) };

		em.emit('log', log);

		if(exports.logPath)
		{
			if(!logsToSave[log.type]) logsToSave[log.type] = [];

			logsToSave[log.type].push(log);

			saveLogs();
		}
	}
	
	
}

exports.init = init;

init();
