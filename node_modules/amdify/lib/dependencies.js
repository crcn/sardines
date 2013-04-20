var structr = require("structr"),
_ = require("underscore"),
asyngleton = require("asyngleton"),
fs = require("fs"),
outcome = require("outcome");

var Dependency = structr({

  /**
   */

  "__construct": function(data) {
    _.extend(this, data);
  },

  /**
   */

  "content": function(value) {
    if(arguments.length) this._content = value;
    return this._content || (this._content = fs.readFileSync(this.path, "utf8"));
  }
});


module.exports = function(source) {
  return source.map(function(item) {
    return new Dependency(item);
  }) 
}