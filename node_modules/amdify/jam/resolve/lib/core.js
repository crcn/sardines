define(["require", "resolve/lib/coreon"], function(require) {

    var __dirname = "resolve/lib",
    __filename    = "resolve/lib/core.js",
    module        = { exports: {} },
    exports       = module.exports,
    define        = undefined,
    window        = exports;

    

    module.exports = require("resolve/lib/coreon").reduce(function (acc, x) {
    acc[x] = true;
    return acc;
}, {});


    return module.exports;
});