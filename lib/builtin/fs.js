if(!!process.version) {
  return module.exports = global.require("fs");
}


var allFiles = _sardines.allFiles;

exports.statSync = function(path) {
	return {
		isDirectory: function() {
			return !path.match(/\.\w+$/);
		}
	}
}

module.exports.readdirSync = function(path) {

	console.log(cp)
	var parts = path.split('/'),
	cp = allFiles;

	parts.forEach(function(part) {
		cp = cp[part];
	});

	if(!cp) return [];


	return Object.keys(cp);
}

module.exports.realpathSync = function(path) {
	console.log("RPS");
}

