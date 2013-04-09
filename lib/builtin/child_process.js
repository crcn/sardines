if(!!process.version) {
  return module.exports = global.require("child_process");
}