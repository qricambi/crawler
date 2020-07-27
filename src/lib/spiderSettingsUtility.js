const axios = require("axios")

module.exports.GetSpiderSettings = async (accountid, type ,key) => {
  let accountmeta = await axios({ 
    method: "post", 
    url: "http://webapigo:5000/Account/GetAccountMetadata", 
    data: { "AccountId": accountid.toString(), "Type": type, "Key": key } })
  return accountmeta.data
}

module.exports.GetSpiderSettingsByAccount = async (accountid, key) => {
  let accountmeta = await axios({ 
    method: "post", 
    url: "http://webapigo:5000/Account/GetAccountMetadataByKey", 
    data: { "AccountId": accountid.toString(), "Key": key  } })
  return accountmeta.data
}