var structr = require("structr");
module.exports = structr({

  /**
   */

  "__construct": function() {

  },

  /**
   */

  "write": function(dep, next) {
    next();
  },

  /**
   */

  "test": function(dep) {
    return false;
  },

  /**
   */

  "end": function(next) {
    next();
  }
});