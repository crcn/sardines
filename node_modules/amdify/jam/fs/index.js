define(["require"], function(require) {

    var __dirname = "fs",
    __filename    = "fs/index.js",
    module        = { exports: {} },
    exports       = module.exports,
    define        = undefined,
    window        = exports;

    

    var allFiles = _sardines.allFiles;

exports.statSync = function(path) {
	return {
		isDirectory: function() {
			return !path.match(/\.\w+$/);
		}
	}
}

exports.readdirSync = function(path) {

	var parts = path.split('/'),
	cp = allFiles;

	parts.forEach(function(part) {
		cp = cp[part];
	});

	if(!cp) return [];


	return Object.keys(cp);
}

exports.realpathSync = function(path) {
}



    return module.exports;
});