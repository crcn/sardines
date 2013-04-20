templates = require("../templates"),
path      = require("path");

module.exports = require("./base").extend({

  /**
   */

  "__construct": function(pathNameOrRenderer) {
    if(typeof pathNameOrRenderer === "function") {
      this.render = pathNameOrRenderer;
    } else {
      this.render = templates[pathNameOrRenderer] || templates.renderer(pathNameOrRenderer);
    }
  },

  /**
   */

  "write": function(dep, callback) {

    function getName(dep) {
      return dep.isMain ? dep.moduleName : dep.alias;
    }

    var options = {
      __dirname: path.dirname(dep.alias),
      __filename: dep.alias,
      name: getName(dep),
      dependencies: dep.dependencies.map(function(dep) {
        dep.name = getName(dep);
        return dep;
      }),
      content: dep.content()
    };
    
    dep.content(this.render(options));
    callback();
  }
});