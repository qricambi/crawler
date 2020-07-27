process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" //non eliminare per self-signed certificati

var zlib = require("zlib")
var crypto = require('crypto')
var esprima = require("esprima")
const util = require("util")
const dto = require("./dto")
const path = require("path")


//var defiant = require("defiant.js")
let escodegen = require("escodegen")
var TreeModel = require("tree-model")
var serialize = require('serialize-javascript')
var redis = require("redis")
var rediscli = redis.createClient(process.env.RedisPORT, process.env.RedisHOST, {
  db: process.env.RedisDB,
  return_buffers: true
})
const {
  promisify
} = require('util')
const getAsync = promisify(rediscli.get).bind(rediscli)
const setAsync = promisify(rediscli.set).bind(rediscli)
const inflate = promisify(zlib.inflate).bind(zlib)
const deflate = promisify(zlib.deflate).bind(zlib)
// seconds * minutes * hours
const EXPIRE_CREDS = 60 * 60 * 1
//let redisc = new Redis(process.env.RedisPORT, process.env.RedisHOST)
let fs = require("fs")
var truepromise = esprima.parseScript("new Promise((res, rej) => res({Authenticated: true}))").body[0]
//var truepromise = esprima.parseScript("new Promise((res, rej) => res({Authenticated: true}))").body[0]
//var truepromise = esprima.parseScript("let test = await new Promise((res, rej) => res())").body[0]
var rewire = require("rewire")

var workingSpiders = ["gruppoautouno", "coopar", "fencar", "autover", "centroricambiauto", "stahlgruber", "eurofrance", "tdaparts", "3giricambi", "ajsparts", "autoricambipierobon", "febest", "laricambi", "sores", "tecneco", "vetrauto", "abs", "agmasrl", "autoleader", "autolux", "autoricambiserena", "bcrsrl", "centroricambidue", "cieffepi", "cire", "cosso", "crt", "decaspa", "ecommerce8", "emporiomarmitte", "enzodolfi", "eurogamma", "favarimeazza", "fcarparts", "gds", "giemmesrl", "grdistribuzioni", "italtecnica", "mainaspa", "mapco", "mattielloparts", "neoparts", "nuovacerivensrl", "puddusrl", "raffparts", "recar", "tecnotrading", "remarc", "riemricambi", "saffioti", "sarfa", "sarpifirenze", "sasson", "schwenker", "silcat", "svar", "topcar", "tricar", "unionricambi", "zagoricambi", "rhibo", "ricambirigenerati", "derasrl", "miracarparts", "rasini", "cersa", "saladini", "trevi", "crystaldrive", "autogammacommerce", "rmelettrikar", "trovaricambiusati", "fts", "matec", "gbautoricambi", "treffegroup", "generalricambi", "redline", "oriente", "unirade", "diesellevante", "carsolution", "aerosus", "ahecooling", "bearmach", "autoclima", "birth", "commercialelucana", "eatoscana", "edb09", "gruppoubs", "isam", "italdisradiatori", "maxnetsrl", "melchioni", "realauto", "saito", "turbogroup", "autofrance", "cramersrl", "ecommerce3", "ecommerce6", "era", "extranetvaleo", "gammaricambi", "koklitservice", "mecdiesel", "paoloni", "vamaricambi", "vemo", "nuovarafco", "abcar", "admarche", "armandoofficio", "autodis", "automeccanicalucana", "autoricambicori", "carservicepd", "cati", "cda", "celkar", "centroricambi", "ceram", "cida", "consorziorac", "cora", "demauto", "derauto", "drcannavo", "duegricambi", "ecommerce2", "ecommerce4", "ecommerce5", "ecommerce7", "ecommercecatricambi", "ett", "europarts", "fgl", "fidiricambi", "gra", "hella", "idir", "intercars", "malo", "marelli", "mdr", "metzger", "midraricambi", "molco", "morsiani", "nuovacristiani", "partco", "partsadvisor", "pelloni", "piviricambi", "ramrg", "rcr", "realsud", "redcar", "rilub", "rpsautomotive", "saragoni", "schaeferbarthold", "sdgs", "sirauto", "stahlgruber", "targetracing", "trione", "cdr", "ocra", "stahlgruber", "sirepd", "waysrl", "adrautomotive", "trost", "redlineold", "miglionico", "automarket24", "bremsi", "japko", "sigmauto", "sorasrl", "frigair", "sardasaf"]

var firstTrance = [
  "gruppoautouno",
  "demauto",
  "europarts",
  "miracarparts",
  "trovaricambiusati",
  "vemo",
  "schaeferbarthold",
  "idir",
  "marelli",
  "autofrance",
  "aerosus",
  "carsolution",
  "abcar",
  "rasini",
  "metzger",
  "diesellevante",
  "oriente",
  "fcarparts",
  "bearmach",
  "eurofrance",
  "extranetvaleo",
  "ajsparts",
  "stahlgruber",
  "fts",
  "cieffepi",
  "schwenker",
  "molco", "coopar", "fencar", "autover", "centroricambiauto", "stahlgruber", "eurofrance", "tdaparts", "3giricambi", "ajsparts", "autoricambipierobon", "febest", "laricambi", "sores", "tecneco", "vetrauto", "abs", "agmasrl", "autoleader", "autolux", "autoricambiserena", "bcrsrl", "centroricambidue", "cieffepi", "cire", "cosso", "crt", "decaspa", "ecommerce8", "emporiomarmitte", "enzodolfi", "eurogamma", "favarimeazza", "fcarparts", "gds", "giemmesrl", "grdistribuzioni", "italtecnica", "mainaspa", "mapco", "mattielloparts", "neoparts", "nuovacerivensrl", "puddusrl", "raffparts", "recar", "tecnotrading", "remarc", "riemricambi", "saffioti", "sarfa", "sarpifirenze", "sasson", "schwenker", "silcat", "svar", "topcar", "tricar", "unionricambi", "zagoricambi", "rhibo", "ricambirigenerati", "derasrl", "miracarparts", "rasini", "cersa", "saladini", "trevi", "crystaldrive", "autogammacommerce", "rmelettrikar", "trovaricambiusati", "fts", "matec", "gbautoricambi", "treffegroup", "generalricambi", "redline", "oriente", "unirade", "diesellevante", "carsolution", "aerosus", "ahecooling", "bearmach", "autoclima", "birth", "commercialelucana", "eatoscana", "edb09", "gruppoubs", "isam", "italdisradiatori", "maxnetsrl", "melchioni", "realauto", "saito", "turbogroup", "autofrance", "cramersrl", "ecommerce3", "ecommerce6", "era", "extranetvaleo", "gammaricambi", "koklitservice", "mecdiesel", "paoloni", "vamaricambi", "vemo", "nuovarafco", "abcar", "admarche", "armandoofficio", "autodis", "automeccanicalucana", "autoricambicori", "carservicepd", "cati", "cda", "celkar", "centroricambi", "ceram", "cida", "consorziorac", "cora", "demauto", "derauto", "drcannavo", "duegricambi", "ecommerce2", "ecommerce4", "ecommerce5", "ecommerce7", "ecommercecatricambi", "ett", "europarts", "fgl", "fidiricambi", "gra", "hella", "idir", "intercars", "malo", "marelli", "mdr", "metzger", "midraricambi", "molco", "morsiani", "nuovacristiani", "partco", "partsadvisor", "pelloni", "piviricambi", "ramrg", "rcr", "realsud", "redcar", "rilub", "rpsautomotive", "saragoni", "schaeferbarthold", "sdgs", "sirauto", "stahlgruber", "targetracing", "trione", "cdr", "ocra", "stahlgruber", "sirepd", "waysrl", "adrautomotive", "trost", "redlineold", "miglionico", "automarket24", "bremsi", "japko", "sigmauto", "sorasrl", "frigair", "sardasaf"
]

module.exports.SupportSession = function (scraper) {
  return workingSpiders.filter(ws => firstTrance.includes(ws)).includes(scraper)
}

module.exports.SearchWithSession = SearchWithSession

let getchildpropertyname = (node) => {
  if (node.model.init) {
    return "init"
  } else if (node.model.declarations) {
    return 'declarations'
  } else if (node.model.argument) {
    return 'argument'
  } else if (node.model.block) {
    return "block"
  } else if (node.model.alternate) {
    return "alternate"
  } else if (node.model.consequent) {
    return "consequent"
  } else {
    return "body"
  }
}
var treemodel = new TreeModel({
  childrenPropertyName: getchildpropertyname
})

async function SearchWithSession(scraper, accountid, userid, username, password, skus, proxyid) {
  console.log("SESSIONPROXYKEY", proxyid)
  let scraperimport = '../webspider/' + scraper
  let scrapermodule = rewire(scraperimport)
  scrapermodule.__set__({
    console: {
      log: console.log
    }
  })

  let searchfunction = scrapermodule.search.toString()

  let cachedlogin = await getCachedLogin(scraper, accountid, userid, username, password)
  let cachedmoddata = null
  if (cachedlogin) {
    console.log("IS CACHED BOI")
    cachedmoddata = scrapermodule.__get__("(" + cachedlogin.toString() + ")")
    scrapermodule.__set__({
      Login: scrapermodule.__get__("(" + await DoNotFailLoginSearch(scrapermodule.login.toString(), true) + ")")
    })
  }
  let res = []

  for (var i = 0; i < 2; i++) {
    try {
      res = await MokeyPatchedSearch(scraper, scraperimport, scrapermodule, {
        username: username,
        password: password,
        skus: skus,
        proxyid: proxyid,
        accountid: accountid,
        userid: userid
      }, searchfunction, cachedmoddata)
      break
    } catch (e) {
      console.log(e)
      scrapermodule = rewire(scraperimport)
      scrapermodule.__set__({
        console: {
          log: console.log
        }
      })
      cachedlogin = null
      cachedmoddata = null
      await invalidateCachedLogin(scraper, accountid, userid, username, password)
      if (i === 1) {
        throw e
      }
    }
  }
  return res
}


async function MokeyPatchedSearch(scraper, scraperimport, scrapermodule, searchparams, searchfunction, cachedmoddata) {
  let res = []
  let datatobecached = null
  scrapermodule.__set__({
    Search: scrapermodule.__get__("(" + await ReturnImmediatelyLoginResult(searchfunction) + ")")
  })
  scrapermodule.search = scrapermodule.__get__("Search")
  console.log("SEARCHPARAMS", searchparams)
  res = await scrapermodule.search(searchparams.username, searchparams.password, searchparams.skus, searchparams.proxyid)
  console.log("FIRST LOGIN", res)
  if (!cachedmoddata) {
    if (!res.Authenticated) {
      return [dto.webspider_data_result(scraper, "", "", "", "", util.format("Login %s errata per %s", scraper, searchparams.username), "0.0", "", "", "")]
    }
    datatobecached = await GetDataToCache(scraperimport, scrapermodule)
    if (datatobecached) {
      setCachedLogin(scraper, searchparams.accountid, searchparams.userid, searchparams.username, searchparams.password, datatobecached).then(() => {
        console.log("set in cache ok")
      }).catch((e) => {
        console.log("NOT SET IN CACHE ERROR", e)
      })
    }
  } else {
    for (var k of Object.keys(cachedmoddata)) {
      scrapermodule.__set__(k, cachedmoddata[k])
    }
  }

  scrapermodule.__set__({
    Search: scrapermodule.__get__("(" + await DoNotFailLoginSearch(searchfunction) + ")")
  })
  scrapermodule.search = scrapermodule.__get__("Search")
  res = await scrapermodule.search(searchparams.username, searchparams.password, searchparams.skus, searchparams.proxyid)
  console.log("Full search result", res.length)

  return res
}

async function GetLoginStatement(treenodes) {
  return treenodes.first(function (node) {
    return node.model.type === 'CallExpression' && node.model.callee.type === "Identifier" && node.model.callee.name === "Login"
  })
}

async function PushAfterAxiosDeclaration(treenodes, code) {
  let axiosindex = (treenodes.body[0].body.body.length - 1) - treenodes.body[0].body.body.reverse().findIndex(exp => {
    if (exp.type === 'ExpressionStatement' && exp.expression.type === 'AssignmentExpression' && exp.expression.left.name === 'axios') {
      return true
    } else {
      return !!treemodel.parse(exp).first(function (node) {
        return node.model.type === 'ExpressionStatement' && node.model.expression.type === 'AssignmentExpression' && node.model.expression.left.name === 'axios'
      })
    }
  })
  if (axiosindex >= treenodes.body[0].body.body.length) {
    throw Error("No axios assignment")
  }
  treenodes.body[0].body.body.reverse().splice(axiosindex + 1, 0, code)
}



//root is node; original, sub is model
async function SubstituteStatement(root, original, sub) {
  if (root.model[getchildpropertyname(root)] instanceof Array) {
    root.model[getchildpropertyname(root)] = root.model[getchildpropertyname(root)].map((c) => {
      if (c === original) {
        return sub
      } else {
        return c
      }
    })
  } else {
    root.model[getchildpropertyname(root)] = sub
  }
}

async function DoNotFailLoginSearch(source, keeporiginal) {
  let parsed = null
  if (!keeporiginal) {
    parsed = esprima.parseScript(source)
    let treenodes = treemodel.parse(parsed)
    let logincall = await GetLoginStatement(treenodes)
    await SubstituteStatement(logincall.parent, logincall.model, truepromise.expression)
  } else {
    parsed = esprima.parseScript(source)
    //console.log(parsed)
    await PushAfterAxiosDeclaration(parsed, esprima.parse("()=>{return}").body[0].expression.body.body[0])
  }

  return escodegen.generate(parsed)
}

async function invalidateCachedLogin(scraper, accountid, userid, username, password) {
  console.log("Invalidate redis cache", scraper, accountid)
  let credhash = crypto.createHash('sha1').update(username + password).digest('base64')
  rediscli.del([scraper, accountid, credhash].join("|"))
}

async function getCachedLogin(scraper, accountid, userid, username, password) {
  console.log("GET CACHE FROM REDIS", scraper, accountid)
  let credhash = crypto.createHash('sha1').update(username + password).digest('base64')
  let resp = await getAsync([scraper, accountid, credhash].join("|"))
  if (!resp) {
    return null
  }
  return await inflate(resp)
}

async function setCachedLogin(scraper, accountid, userid, username, password, data) {
  console.log("CACHE TO REDIS", scraper, accountid)
  let credhash = crypto.createHash('sha1').update(username + password).digest('base64')
  return await setAsync([scraper, accountid, credhash].join("|"), await deflate(data), "EX", EXPIRE_CREDS)
}


async function ReturnImmediatelyLoginResult(searchsource) {
  let parsed = esprima.parseScript(searchsource)
  let treenodes = treemodel.parse(parsed)
  let logincall = await GetLoginStatement(treenodes)
  let startnode = logincall
  let blockcode = null
  //console.log("return (await "+escodegen.generate((await GetLoginStatement(treenodes)).model)+")")
  // let testmodel = (await GetLoginStatement(treenodes)).model
  let subexp = {
    "type": "ReturnStatement",
    argument: esprima.parse("async () => (await Login(user, password, proxy))").body[0].expression.body
  }
  //console.log(escodegen.generate(subexp))
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!startnode.parent) {
      break
    }
    //  console.log(startnode.parent.type)
    if (startnode.parent.model.type === 'BlockStatement') {
      blockcode = startnode.parent
      break
    } else {
      startnode = startnode.parent
    }
  }
  await SubstituteStatement(blockcode, startnode.model, subexp)
  return escodegen.generate(treenodes.model)
}


async function getModuleVariables(spider) {
  let modsrc = await new Promise((res, rej) => {
    fs.readFile(path.resolve(__dirname, spider + ".js"), function (err, data) {
      if (err) {
        rej(err)
        return
      }
      res(data)
    })
  })
  let parsed = esprima.parseModule(modsrc.toString())
  return parsed.body.map(b => {
    if (b.type === 'VariableDeclaration' && b.declaration && excludeDeclaration(b)) {
      return b
    } else if (b.declarations) {
      b.declarations = b.declarations.filter(d => excludeDeclaration(d))
      if (b.declarations.length) {
        return b
      }
    }
    return null
  }).filter(b => !!b)
}


function excludeDeclaration(d) {
  return (!JSON.stringify(d).includes('name":"axios') &&
  !JSON.stringify(d).includes('name":"SearchResults"') &&
  !JSON.stringify(d).includes('name":"SearchPHandler"') &&
  !JSON.stringify(d).includes("visionClient") &&
  !JSON.stringify(d).includes('name":"require"')) //&&
  //  !JSON.stringify(d).includes('name":"search_result'))
}

async function GetDataToCache(scraper, spidermodule) {
  let datatocache = {}
  let variables = await getModuleVariables(scraper)
  for (var v of variables) {
    for (var decl of v.declarations) {
      let vname = decl.id.name
      datatocache[vname] = spidermodule.__get__(vname)
    }
  }
  //  console.log("CACHED variables", Object.keys(datatocache)) 
  return serialize(datatocache)
}

//console.log(rhiag.__get__("search"))



//hiag.printvars()