var amdify = require("amdify"),
step = require("step"),
fs = require("fs"),
outcome = require("outcome"),
transformers = amdify.transformers,
templates = require("./tpl"),
uglify = require("uglify-js"),
jsp = uglify.parser,
pro = uglify.uglify;


module.exports = function(ops, next) {

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
			try {
				var ast = jsp.parse(content);
				//ast = pro.ast_mangle(ast);
				//ast = pro.ast_squeeze(ast);
				this(null, pro.gen_code(ast, {
					beautify: true,
					ascii_only: true
				}));
			} catch(e) {
				this(null, content);
			}
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
