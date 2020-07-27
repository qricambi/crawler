let axios = require("axios")
let dto = require("./dto")
const _ = require("lodash")

function codeToUse(ecommerce_code, code) {
  let ecommerce_c = (ecommerce_code || '').trim().toLowerCase()
  if(ecommerce_c && ecommerce_c !== 'ecommerce_code'){
    return ecommerce_code.trim()
  }
  return (code || '').trim()
}

async function GetClassifications(code, brand, description){
  try {
    brand = (brand || "").toLowerCase().trim() 
    let resp = await axios({
      method: "POST",
      url: "http://10.164.15.193:8000/classify",
      timeout: 5000,
      headers: {"content-type": "application/json"},
      data: {brand: brand, description: description, code: code}
    })
    return {
      prediction: resp.data.prediction, 
      confidence: resp.data.confidence,
      macroconfidence:  resp.data.macroconfidence ,
      macroprediction:  resp.data.macroprediction,
      brandclassified:  resp.data.brandclassified
    }
  }catch(e){
    return {
      prediction: null, 
      confidence: null,
      macroconfidence: null,
      macroprediction: null,
      brandclassified: null
    }
  }
}

class SearchResults extends Array {
  async getResults(){
    let that = this
    that.classificationRequests = await Promise.all(that.classificationRequests)
    return Array.from(this).map((v, i) => {
      v["Tagged_brand"] = JSON.stringify(that.classificationRequests[i].brandclassified)
      v["Tagged_category"] = that.classificationRequests[i].prediction
      v["Tagged_confidence"] = that.classificationRequests[i].confidence
      v["Tagged_category_macro"] = that.classificationRequests[i].macroprediction
      v["Tagged_confidence_macro"] = that.classificationRequests[i].macroconfidence
      return v
    })
  }
  sort(){
    throw new Error("NOT IMPLEMENTED")
  }
  splice(){
    throw new Error("NOT IMPLEMENTED")
  }
  toLocaleString(){
    throw new Error("NOT IMPLEMENTED")
  }
  reduce(){
    throw new Error("NOT IMPLEMENTED")
  }
  toSource(){
    throw new Error("NOT IMPLEMENTED")
  }
  
  shift(){throw new Error("NOT IMPLEMENTED")}
  unshift(){throw new Error("NOT IMPLEMENTED")}
  copyWithin(){
    throw new Error("NOT IMPLEMENTED")
  }
  entries(){
    throw new Error("NOT IMPLEMENTED")
  }
  fill(){
    throw new Error("NOT IMPLEMENTED")
  }
  flat(){
    throw new Error("NOT IMPLEMENTED")
  }
  flatMap(){
    throw new Error("NOT IMPLEMENTED")
  }
  reduceRight(){
    throw new Error("NOT IMPLEMENTED")
  }
  
  constructor(baseArray, initRequests=true){
    if(baseArray && Array.isArray(baseArray)){
      super()
      Object.assign(this, baseArray)
      if(initRequests){

        this.classificationRequests = baseArray.map(b => GetClassifications(codeToUse(b.Ecommerce_code, b.Code), b.Manufacturer, b.Description))
      }else{
        this.classificationRequests = []
      }
    }else{
      super()
      this.classificationRequests = []
    }
  }

  concat(sumarraytmp){
    let sumarray = new SearchResults([], false)
    if(sumarraytmp instanceof SearchResults){
      sumarray = sumarraytmp
    }else{
      sumarray = new SearchResults(Array.from(sumarraytmp), true)
    }
    let sr = new SearchResults(Array.from(this).concat(Array.from(sumarray)), false)
    sr.classificationRequests = this.classificationRequests.concat(sumarray.classificationRequests)
    return sr
  }
  
  filter(callback, thisarg){
    let indexes = Array.from(this).map((v,i) => [v,i]).filter((v,i,a) => callback(v[0],i,a),thisarg).map(v => v[1])
    let res = new SearchResults(indexes.map(i => this[i]), false)
    res.classificationRequests = indexes.map(i => this.classificationRequests[i])
    return res
  }
  map(callback,thisarg){
    let beforeResult = Array.from(this)
    let result = Array.from(this).map(callback, thisarg)
    let searchResultType = true 
    for(let i = 0; i < beforeResult.length; i++){
      if(!(typeof result[i] === 'object' && result[i] !== null && _.isEqual(_.sortBy(Object.keys(result[i])), _.sortBy(Object.keys(beforeResult[i]))))){
        searchResultType = false
        break
      }
    }
    if(searchResultType){
      result = new SearchResults(result, false)
      result.classificationRequests = this.classificationRequests
    }
    return result
  }
  pop(){
    this.classificationRequests.pop()
    return super.pop()
  }
  /*  push(elem){
    this.classificationRequests.push(null)
    super.push(elem)
  }*/
  reverse(){
    super.reverse()
    this.classificationRequests.reverse()
    let sr = new SearchResults(Array.from(this), false)
    sr.classificationRequests = this.classificationRequests
    return sr
  }
  slice(a,b){
    let rs = new SearchResults(super.slice(a,b), false)
    rs.classificationRequests = this.classificationRequests.slice(a,b)
    return rs
  }

}

module.exports = {
  SearchResults: SearchResults,
  proxyHandler: {
    set(obj, prop, value) {
      if(Number.isInteger(+prop)){
        obj[prop] = value
        let oldval = obj.classificationRequests[prop]
        if(!oldval || 
          (value.Ecommerce_code ? value.Ecommerce_code !== oldval.Ecommerce_code : value.Code !== oldval.Code) ||
          value.Manufacturer !== oldval.Manufacturer ||
          value.Description !== oldval.Description
        ){
          obj.classificationRequests[prop] = GetClassifications(codeToUse(value.Ecommerce_code, value.Code), value.Manufacturer, value.Description)
        }
      }else{
        Reflect.set(...arguments)
      }
      return true
    }
  }
}