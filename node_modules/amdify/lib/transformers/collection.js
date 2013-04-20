
var async = require("async");


/**
 * runs multiple transformers side by side
 */

module.exports = require("./base").extend({

  /**
   */

  "__construct": function(transformers) {
    this._transformers = transformers;
  },

  /**
   */

  "write": function(dep, next) {
    async.eachSeries(this._transformers, function(transformer, next) {
      transformer.write(dep, next);
    }, next)
  },

  /**
   */

  "end": function(next) {
    async.eachSeries(this._transformers, function(transformer, next) {
      transformer.end(next);
    }, next);
  }
});