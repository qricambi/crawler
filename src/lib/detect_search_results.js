let esprima = require("esprima")
let escodegen = require("escodegen")
let fs = require("fs")
let path = require("path")
let _ = require("lodash")
let searches = {}
let files = fs.readdirSync(path.resolve(__dirname, '../webspider'))
let returnsids  = {}
let ifstatements = {}
let notreturnsid = {}
function findBlockByType(body, type){
  let betterbody = body.map(k =>  {
    let b = Object.assign({}, k)
    if((b.consequent || b.alternate)){
      b.body = (b.body || []).concat([b.consequent, b.alternate]).filter(k => !!k)
      b.body = b.body.length > 0 ? b.body : undefined
    }else if(!b.body && b.block){
      b.body = b.block
    }
    return b
  })
  let foundtypes = betterbody.filter(b => b.type === type)
  return foundtypes.concat(betterbody.filter(b => ((b.body || {}).body || b.body || []).length > 0).map(c => findBlockByType(Array.isArray(c.body) ? c.body : c.body.body, type)).reduce((a, b)=> a.concat(b), []) )
}

for(let filename of files){
  if(["amazon.js", "ebay.js", "mister-auto.js", "siria.js", "google.js", "medirsrl.js"].includes(filename)){
    continue
  }
  let file = fs.readFileSync(path.resolve(__dirname, '../webspider')+'/'+filename)
  let filebody = file.toString("utf8")
  let program = esprima.parseScript(filebody)
  
  let foundsearch = false
  try{
    foundsearch = program.body.filter(b => b.type === 'FunctionDeclaration').filter(f => f.id.name === 'Search').length === 1
  }catch(e){}
  if(!foundsearch){
    continue
  }
  var allsearchassign = []
  esprima.parseScript(filebody,{range: true}, function(node){
    if(node.type === 'AssignmentExpression' && ['search_result', 'results', 'result'].includes(node.left.name) ){
      allsearchassign.push(node)
    }else if (node.type === 'VariableDeclaration' && node.declarations.filter(d => ['search_result', 'results', 'result'].includes(d.id.name)).length > 0){
      allsearchassign.push(node)
    }else if (node.type === 'IfStatement' && escodegen.generate(node.test).indexOf(".Authenticated") >= 0){
      ifstatements[filename] = node
    }
  })
  
  allsearchassign = _.uniq(allsearchassign.map(a => escodegen.generate(a)))
  let jsimport = 'const sr = require("../lib/search_results.ks")\nconst SearchResults = sr.SearchResults\nconst SearchPHandler = sr.proxyHandler\n'
  let jsline = ''
  let splitloc = ifstatements[filename].alternate ? ifstatements[filename].alternate.range[0]+1 : ifstatements[filename].range[1]
  if(allsearchassign.findIndex(k => k.includes("search_result")) >= 0){
    jsline = '\nsearch_result = '
  }else if(allsearchassign.findIndex(k => k.includes("results")) >= 0){
    jsline = '\nresults = '
  }else if(allsearchassign.findIndex(k => k.includes("result")) >= 0){
    jsline = '\nresult = '
  }else{
    console.log("SKIPPED", filename)
    continue
  }
  jsline += 'new Proxy(new SearchResults([]), SearchPHandler)'
  fs.writeFileSync(path.resolve(__dirname, '../webspider')+'/'+filename, jsimport+filebody.slice(0,splitloc)+jsline+filebody.slice(splitloc))

}

