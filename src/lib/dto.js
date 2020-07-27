const _ = require("lodash")
const NOAVALABILITY = {
  code: 0,
  desc: ""
}

module.exports.ome_type = Object.freeze({
  "OEM": 0,
  "Replacement": 1,
  "Cross":2,
  "Refparts":3
})

module.exports.check_login_result = (scrape, result, message) => {
  return {
    Spider: scrape,
    Authenticated: result,
    Message: message
  }
}

module.exports.webspider_data_result = (
  scrape = "",
  account_id = 0,
  user_id = 0,
  from_code_search = "",
  manufacturer ="",
  application = "",
  code = "",
  ecommerce_code = "",
  cross_codes="",
  description="",
  long_description= "",
  details = "",
  condition = "",
  weight= null,
  price=  null,
  retail_price =  null,
  web_price =  null,
  availability =  null,
  img = "",
  link = "",
  quantity_discount = [],
  manufacturing = null,
  promo = false,
  promo_text = ""
) => {

  if(quantity_discount){
    for(let i = 0; i < quantity_discount.length;i++){
      quantity_discount[i].price = (quantity_discount[i].price || {}).replace(",", ".")
    }
  }
  if(availability){
    availability["desc"] = (availability["desc"] || "").trim()
  }
  return {
    Ecommerce: _.startCase(_.camelCase(scrape)).trim(),
    Search_date:new Date(),
    Account_id:account_id,
    User_id:user_id,
    From_code_search: from_code_search.trim(),
    Manufacturer: manufacturer.trim(),
    Application: application.trim(),
    Code: code.trim(),
    Ecommerce_code: ecommerce_code.trim(),
    Cross_codes:cross_codes.trim(),
    Description: (description || "").trim(),
    Long_description: long_description.trim(),
    Details:details.trim(),
    Condition:condition.trim(),
    Weight:!_.isUndefined(weight) && !_.isNull(weight)?weight.trim():"",
    Price: !_.isUndefined(price) && !_.isNull(price)?price.replace(",", ".").trim():"0",
    Retail_price:!_.isUndefined(retail_price) && !_.isNull(retail_price)?retail_price.replace(",", ".").trim():"0",
    Web_price:!_.isUndefined(web_price) && !_.isNull(web_price)?web_price.replace(",", ".").trim():"0",
    Availability: _.isNull(availability) || _.isUndefined(availability)? NOAVALABILITY:availability,
    Img: img,
    Link: link,
    Quantity_discount: _.isNull(quantity_discount) || _.isUndefined(quantity_discount) ? [] : quantity_discount,
    Manufacturing: _.isNull(manufacturing) || _.isUndefined(manufacturing)? NOAVALABILITY:manufacturing, //NOAVALABILITY va bene anche in questo caso
    Promo : (typeof promo == typeof false) ? promo : false,
    Promo_text : (promo_text || "").toString().trim(),
    FromTypeSearch:null
  }
}

module.exports.webspider_data_oem_article = (
  type,
  scrape,
  from_code_search,
  manufacturer,
  code,
  description,
  price,
  pricelist,
  producers = {}
) => {
  return {
    TypeOem: type,
    Search_date:new Date(),
    Ecommerce:_.startCase(_.camelCase(scrape)),
    From_code_search: from_code_search,
    Manufacturer: manufacturer,
    Code: code,
    Description: description,
    Price: !_.isUndefined(price) && !_.isNull(price)?price.replace(",", "."):0,
    PriceList: pricelist,
    Producers: producers
  }
}

module.exports.webspider_data_oem_ref = (
  type,
  scrape,
  from_code_search,
  code,
  catalogreferences,
  name
) => {
  return {
    TypeOem: type,
    Search_date:new Date(),
    Ecommerce:_.startCase(_.camelCase(scrape)),
    From_code_search: from_code_search,
    Code: code,
    Catalogreferences: catalogreferences,
    Name: name
  }
}


module.exports.webspider_data_result_oem = (search_result, article_oem,cross_articles,partReference=[]) => {
  return {
    Alternatives: cross_articles,
    Oem: article_oem,
    Rows: search_result,
    PartReference:partReference
  }
}