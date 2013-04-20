define(["require"], function(require) {

    var __dirname = "ejs/lib",
    __filename    = "ejs/lib/utils.js",
    module        = { exports: {} },
    exports       = module.exports,
    define        = undefined,
    window        = exports;

    

    
/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
 

    return module.exports;
});