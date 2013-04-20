define(["require", "resolve/lib/core", "resolve/lib/async", "resolve/lib/sync"], function(require) {

    var __dirname = "resolve",
    __filename    = "resolve/index.js",
    module        = { exports: {} },
    exports       = module.exports,
    define        = undefined,
    window        = exports;

    

    var core = require("resolve/lib/core");
exports = module.exports = require("resolve/lib/async");
exports.core = core;
exports.isCore = function (x) { return core[x] };
exports.sync = require("resolve/lib/sync");


    return module.exports;
});