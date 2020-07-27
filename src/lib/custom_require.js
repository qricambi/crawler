const fs = require("fs")

function GetAllSpiders(spidername){
  let prefixPath = "../webspider/"
  let spiders = {}
  try{ 
    if(spidername){
      delete require.cache[require.resolve(prefixPath + spidername+".js")]
      spiders[spidername] = (require(prefixPath+spidername+".js"))
    } else {
      fs.readdirSync(__dirname + "/../webspider").map(f => f.replace(".js", "")).forEach(scraper => {
        let mod = require.cache[require.resolve(prefixPath + scraper)]
        try{var ix = mod.parent.children.indexOf(mod)
          if (ix >= 0) mod.parent.children.splice(ix, 1)}catch(e){}
        delete require.cache[require.resolve(prefixPath + scraper)]
        spiders[scraper.replace(".js", "")] = (require(prefixPath+scraper))
      })
    }
  }catch(e){
    console.log(e)
  }   
  console.log(spiders)
  return spiders
}

module.exports.GetAllSpiders = GetAllSpiders
