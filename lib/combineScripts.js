var parseFile    = require('./tpl/parser').parseFile,
async            = require('async'),
step             = require('stepc'),
fs               = require('fs'),
outcome          = require('outcome'),
utils            = require('./utils'),
getPkgName 		 = utils.getPackageName,
modulePath 		 = utils.modulePath,
crc32			 = require('crc32');

/**
 * takes a list of scripts, and combines them into one using a given template
 */


exports.shrinkwrap = function(ops, callback) {
 		
 	//entry points into the given script
 	var entries = ops.entries || [],

 	//scripts to include
 	include     = ops.include;


 	var on = outcome.error(callback);


 	step(
 		function() {
 			
 			async.map(include, getModuleTplBuffer, this);

 		},
 		on.success(function(modules) {

 			// this(null, parseFile({}))
 			
 			var buffer = [];


 			// buffer.push(fs.readFileSync(__dirname + "/tpl/shim.tpl.js"));
 			buffer.push(fs.readFileSync(__dirname + "/tpl/main.tpl.js"));
 			buffer.push(modules.join('\n\n'));
 			buffer.push(parseFile({ entries: stringifyEntries(entries) }, __dirname + "/tpl/entry.tpl.js"));




 			this(null, parseFile({ body: buffer.join('\n\n'), name: '__app', buildId: ops.buildId }, __dirname + "/tpl/body.tpl.js"));
 		}),
 		callback
 	)

 }

 exports.browserify = function(ops, callback) {

 	var include = ops.include;

 	if(!ops.wrap) {
 		ops.wrap = "?wrap";
 	}

 	step(

 		function() {

 			var buffer = [];
 			buffer.push(fs.readFileSync(__dirname + "/tpl/main.tpl.js"));
 			buffer.push(fs.readFileSync(__dirname + "/tpl/loadAsync.tpl.js"));

 			buffer = buffer.concat(include.map(function(inc) {
 				return parseFile({ path: inc.path.replace(ops.directory, "") + ops.wrap + "&buildId=" + ops.buildId, alias: inc.alias }, __dirname + "/tpl/addAsnc.tpl.js");
 			}).reverse());

 			this(null, buffer.join("\n"));
 		},
 		callback
 	);
 }


exports.wrap = function(ops, callback) {
	callback(null, parseFile({ content: fs.readFileSync(ops.entry.path, "utf8") }, __dirname + "/tpl/wrap.tpl.js"));
}

function stringifyEntries(entries, property) {
	var buffer = [];

	for(var i = entries.length; i--;) {
		buffer.push("\"" + entries[i].alias + "\"");
	}

	return "[" + buffer.join(",") + "]";
}


 function getModuleTplBuffer(script, callback) {
 	
 	var on = outcome.error(callback);

 	step(
 		function() {
 			if(!script) return callback(null);
 			
 			fs.readFile(script.path, "utf8", this);
 		},
 		on.success(function(content) {


 			var path = script.alias, tplFile = __dirname + '/tpl/module.tpl.js';


 			var buffer = parseFile({ path: path, content: content}, tplFile);

 			if(script.isMain) {
 				buffer += '\n\n' + parseFile({ path: modulePath(script), content: "module.exports = require('"+path+"');" }, tplFile);
 			}

 			this(null, buffer);	
 		}),
 		
 		callback


 	);
 }