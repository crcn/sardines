require('colors');

var EventEmitter = require('events').EventEmitter,
	lazyCallback = require('../../core/lazy').lazy.callback,
	fs = require('fs'),
	Queue = require('../../core/queue').Queue;


var _loggerPartial = function(target, emit, type, color)
{
	
	target[type] = function()
	{
		arguments[0] = arguments[0][color];
		
		console.log.apply(null, arguments)
		
		// emit(type, msg);
	}
}


exports.newLogger = function(ops)
{
	if(!ops) ops = {};
	
	var target = ops.target || {};
	
	if(target.controls) return target.controls;
	
	var logPath = ops.logPath,
	em = new EventEmitter(),
	logTypes = ops.logTypes || 'fatal|warning|error|fail|notice|ok|success|message',
	loggers = {
		'message' : null,
		'verbose' : 'blue',
		'error'   : 'red',
		'fatal'   : 'red',
		'warning' : 'yellow',
		'notice'  : 'grey',
		'ok'	  : 'magenta',
		'success' : 'green',
		'fail'    : 'red'
	},
	logsToSave = {};

	var saveLogs = lazyCallback(function()
	{
		if(!controls.logPath) return;

		var logs = logsToSave;
		logsToSave = {},
		q = new Queue(true);


		function writeLogs(logType, stack)
		{
			var filePath = controls.logPath + '/' + logType + '.log';

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
		
		// console.log(controls.logPath)
		if(controls.logPath)
		{
			if(!logsToSave[log.type]) logsToSave[log.type] = [];

			logsToSave[log.type].push(log);

			saveLogs();
		}
	}

	function init()
	{
		for(var logType in loggers)
		{
			if(logTypes.indexOf(logType) > -1)
			{
				_loggerPartial(target, emit, logType, loggers[logType])
			}
			else
			{
				target[logType] = function(){};
			}
		}		
	}


	var controls = {
		logPath: logPath,
		enable: function(lt)
		{
			logTypes = lt;
			init();
		},
		verbose: function()
		{
			// controls.enable('')
		},
		logging: function()
		{
			if(arguments.length) return logTypes = arguments[0];
			
			return logTypes;
		},
		logger: target
	};
	
	target.controls = controls;
	
	init();

	return controls;
}



exports.newLogger({target:console})