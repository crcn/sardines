require("structr").mixin(require("asyngleton"));

var analyzeDeps = require('./analyzeDeps'),
outcome         = require('outcome'),
_               = require("underscore"),
dependencies    = require("./dependencies"),
Bundle          = require("./bundle"),
toarray = require("toarray");

outcome.logAllErrors(true);

module.exports = function(ops, next) {


	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */

	var entries = toarray(ops.entry || ops.entries),
	buildId = ops.buildId || Date.now();

	analyzeDeps({ 	
		entries  : entries, 
		platform : ops.platform || "browser",
		prefix   : ops.prefix
	}, outcome.e(next).s(function(result) {
		next(null, new Bundle(dependencies(result.entries), dependencies(result.dependencies)));
	}));
}

module.exports.transformers = require("./transformers");