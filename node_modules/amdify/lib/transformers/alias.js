var fs = require("fs");

/**
 * concatenates all files into one
 */

module.exports = require("./decor").extend({

  /**
   */

  "override __construct": function(options, target) {
    this.output = options.output;
    this._buffer = [];
    this._super(target);
  },

  /**
   */

  "_write": function(dep, next) {
    this._buffer.push(dep.content());
    next();
  },


  /**
   */

  "_end": function(callback) {
    fs.writeFile(this.output, this._buffer.join("\n"))
  }
});