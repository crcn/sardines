var fs = require("fs"),
renderer = require("./renderer");

fs.readdirSync(__dirname).forEach(function(name) {
  if(!/\.ejs$/.test(name)) return;
  exports[name.split(".").shift()] = renderer(__dirname + "/" + name);
})