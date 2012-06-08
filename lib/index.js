var analyzeDeps = require('./analyzeDeps'),
combineScripts  = require('./combineScripts'),
path            = require('path'),
outcome         = require('outcome'),
middleware      = require('./middleware'),
_ = require("underscore");


module.exports = function(ops, next) {



	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */

	var include = [ops.entry].concat(ops.include || []),
	buildId = ops.buildId || Date.now();


	analyzeDeps({ entries: include }, outcome.error(next).success(function(deps) {


		if(ops.method == "shrinkwrap") {
			combineScripts.shrinkwrap({
				include: deps,
				entries: [deps[0]],
				buildId: buildId
			}, next);
		} else 
		if(ops.method == "browserify") {
			combineScripts.browserify({
				wrap: ops.wrap,
				include: deps,
				directory: ops.directory,
				buildId: buildId
			}, next)
		} else 
		if(ops.method == "wrap") {
			combineScripts.wrap({
				entry: deps[0]
			}, next);
		}

		
	}));
}

/**
 */

module.exports.shrinkwrap = function(ops, next) {
	return module.exports(_.extend(ops || {}, {method: "shrinkwrap"}), next);
}


module.exports.browserify = function(ops, next) {
	return module.exports(_.extend(ops || {}, {method: "browserify"}), next);
}


/**
 * express middleware
 */

module.exports.middleware = middleware;

/**
 */

module.exports.analyzeDeps = analyzeDeps;

/**
 */

module.exports.utils = require("./utils");
