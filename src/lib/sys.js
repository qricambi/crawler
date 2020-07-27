const path = require("path")
const fs = require("fs")

function getModuleName (filenamefullpath) {
  return path.parse(filenamefullpath).name
}

module.exports.ModuleName = getModuleName