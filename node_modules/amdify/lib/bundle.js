var structr = require("structr"),
async = require("async");

module.exports = structr({

  /**
   */

  "__construct": function(entries, dependencies) {
    this._deps = dependencies;
    this.entries = entries;
  },

  /**
   */

  "transform": function(transformer, next) {
    if(!next) next = function(){};

    async.forEach(this._deps, function(dep, next) {
      transformer.write(dep, next);
    }, function() {
      transformer.end(next);
    })
  }
});