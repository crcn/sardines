var loggers = {};




var newLogger = function(module) {

	function logger(name) {
	
		return function(msg) {
			console.log(name + ": " + module + ": " + msg);
		}	
	}

	return {
		info: logger('info'),
		warn: logger('warn'),
		error: logger('error'),
		debug: logger('debug'),
		verbose: logger('verbose')
	};
}


exports.loggers = {
	get: function(name) {
		return loggers[name] || (loggers[name] = newLogger(name))
	}
}
