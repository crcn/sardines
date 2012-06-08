var analyzeDeps = require("./analyzeDeps"),
fs = require("fs");


module.exports = function(ops) {

	if(!ops) ops = {};


	return function(req, res, next) {

		var fullPath = ops.directory + "/" + req.path;

		if(!req.path.match(/\.combine\.js$/)) {

			return res.sendfile(fullPath);
		}

		fullPath = fullPath.replace("combine.", "");

		require("./").browserify({
			entry: fullPath,
			directory: ops.directory
		}, function(err, content) {
			res.end(content)
		})
	}
}