var structr = require("structr"),
outcome = require("outcome"),
NoneTransformer = require("./none");

module.exports = structr({

  /**
   */

  "__construct": function(target) {
    this.target = target || new NoneTransformer();
  },

  /**
   */

  "write": function(dep, next) {
    var self = this;
    this.target.write(dep, outcome.e(next).s(function() {
      self._write(dep, next);
    }));
  },

  /**
   */

  "_write": function(dep, next) {
    //OVERRIDE ME
    next();
  },

  /**
   */

  "end": function(next) {
    var self = this;
    this.target.end(outcome.e(next).s(function() {
      self._end(next);
    }))
  },

  /**
   */

  "_end": function(next) {
    next();
  }
});