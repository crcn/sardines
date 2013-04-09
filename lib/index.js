var amdify = require("amdify"),
step = require("step"),
fs = require("fs"),
async = require("async"),
outcome = require("outcome"),
transformers = amdify.transformers,
templates = require("./tpl"),
uglify = require("uglify-js"),
jsp = uglify.parser,
pro = uglify.uglify;

console.log()

module.exports = function(ops, next) {

<<<<<<< HEAD
	var o = outcome.e(next);

	step(
		function() {
			includeEntries(ops, this);
		},
		o.s(function(content) {
			if(!ops.output) {
				return this(null, content);
			}
			fs.writeFile(ops.output, content, "utf8", this);
		}),
		next
	);
=======
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
>>>>>>> 5e65f33771bd3a09133fea21c69d174c706c13eb
}


function includeEntries(ops, next) {

	var buffer = [
		templates.head()
	], o = outcome.e(next);

	step(
		function() {
			amdify({
				entries: ops.entries,
				platform: ops.platform
			}, this)
		},
		o.s(function(bundle) {
			this.bundle = bundle;
			var t = new transformers.Template(templates.module);
			t = new transformers.Concat({ output: this }, t);
			bundle.transform(t);
		}),
		o.s(function(content) {
			buffer.push(content);
			buffer.push(templates.entries({ entries: this.bundle.entries }));
			this(null, templates.wrap({ content: buffer.join("\n") }));
		}),
		o.s(function(content) {
			var ast = jsp.parse(content);
			//ast = pro.ast_mangle(ast);
			//ast = pro.ast_squeeze(ast);
			this(null, pro.gen_code(ast, {
				beautify: true
			}));
		}),
		next
	);
}


function includeEntry(ops, bundle, next) {
	var o = outcome.e(next);
	step(
		function() {
			amdify({
				entry: ops.entry,
				platform: ops.platform
			}, this)
		},
		o.s(function(bundle) {
			this.bundle = bundle;
			var t = new transformers.Template(templates.module);
			bundle.transform(t, this);
		}),
		o.s(function(content) {
			console.log(this.bundle);
		})
	);
}
