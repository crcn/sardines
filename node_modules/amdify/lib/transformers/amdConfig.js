templates = require("../templates");
fs = require("fs");

module.exports = require("./base").extend({

  /**
   */

  "__construct": function(options) {
    this.output = options.output;
    this._config = {
      paths: {}
    };
  },

  /**
   */

  "write": function(dep, next) {
    this._config.paths[dep.moduleName] = dep.alias;
    next();
  },

  /**
   */

  "end": function(next) {
    var content = templates.amdConfig({ config: this._config });
    fs.writeFile(this.output, content, next);
  }
});