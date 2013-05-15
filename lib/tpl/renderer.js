var ejs = require("ejs"),
fs = require("fs");

module.exports = function(path) {
  return ejs.compile(fs.readFileSync(path, "utf8"));
}