var analyzeDeps = require("./analyzeDeps"),
fs = require("fs"),
parseFile = require("./tpl/parser").parseFile;


module.exports = function(ops) {

	if(!ops) ops = {};



	var fns = {
		shrinkwrap: function(ops, onContent) {
			require("./").shrinkWrap({
				entry: ops.path
			}, onContent);
		},
		browserify: function(ops, onContent) {
			require("./").browserify({
			entry: ops.path,
			directory: ops.directory
			}, onContent);
		},
		wrap: function(ops, onContent) {
			onContent(null, parseFile({ content: fs.readFileSync(ops.path) }, __dirname + "/tpl/wrap.tpl.js"));
		}
	}


	return function(req, res, next) {
		var fullPath = ops.directory + "/" + req.path;
		if(req.path.match(/\.js/)) {
			for(var prop in req.query) {
				var fn = fns[prop];
				if(fn) {
					return fn({
						directory: ops.directory,
						path: fullPath
					}, function(err, content) {
						res.setHeader('content-type', "text/javascript");
						res.end(content)
					})
				}
			}
		}

		res.sendfile(fullPath);
	}
}