var renderer = require("./renderer");

module.exports = {
  amd: renderer(__dirname + "/amd.ejs"),
  amdConfig: renderer(__dirname + "/amdConfig.ejs"),
  renderer: renderer
}