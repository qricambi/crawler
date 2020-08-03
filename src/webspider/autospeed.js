const axios = require('axios')
const cheerio = require('cheerio')
const _ = require("lodash")
const util = require("util")
const querystring = require("querystring")
const dto = require("../lib/dto")
const moduleName = require("../lib/sys").ModuleName(__filename)
const a_status = require("../lib/avalability_status")
let biscuit, search_result = []

function status(site_status) {
  if (site_status.includes("Últimas"))
  {
    return {
      code: a_status.other,
      desc: site_status
    }
  }
  else {
    return {
      code: a_status.available,
      desc: site_status
    }
  }
}

async function push($, sku) {
  let rows = Array.from($("article"))
  for (const row of rows) {
    let url = $(row).find(".thumbnail-container").children('a').attr('href')
    let search_call = await axios({
      method: "get",
      url: url,
      headers: {
        "Host": "autospeed.es",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive", 
        "Referer": "https://autospeed.es/busqueda?controller=search&s=" + sku,
        "Cookie": biscuit,
        "Upgrade-Insecure-Requests": "1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "TE": "Trailers"
      }
    })
    let $$ = cheerio.load(search_call.data)
    let price = $$("[itemprop='price']").text().match(/[0-9,.]+/gi)
    let desc = $$("[itemprop='name']").children().text()
    let code = $$("[itemprop='sku']").text()
    search_result.push(dto.webspider_data_result(
      moduleName,
      0,
      0,
      sku,
      $$("img.manufacturer-logo").attr("alt"),
      "",
      code,
      "",
      "",
      desc,
      "",
      "",
      "",
      null,
      price ? price[0].replace(/\./gi,"") : '',
      "",
      null,
      status($$('span.product-last-items').text().trim()),
      "",
      url))

  }
}


async function Login(user, password, proxy) {
  let first_call = await axios({
    method: 'get',
    url: "https://autospeed.es/iniciar-sesion?back=my-account",
    headers: {
      "Host": "autospeed.es",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      "DNT": "1",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache"
    }
  })
  biscuit = first_call.headers['set-cookie']
  let data = {
    'back': 'my-account',
    'email': user,
    'password': password,
    'submitLogin': '1'
  }
  let logon_call = await axios({
    method: "post",
    url: "https://autospeed.es/iniciar-sesion",
    headers: {
      "Host": "autospeed.es",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": "67",
      "Origin": "https://autospeed.es",
      "Connection": "keep-alive",
      "Referer": "https://autospeed.es/iniciar-sesion",
      "Cookie": biscuit,
      "Upgrade-Insecure-Requests": "1",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache"

    },
    data: querystring.stringify(data),
    maxRedirects: 0,
    validateStatus: function (status) {
      return (status >= 200 && status <= 302)
    }
  })
  biscuit = logon_call.headers["set-cookie"]
  if (logon_call.status == "302") {
    return dto.check_login_result(moduleName, true)
  } else
    return dto.check_login_result(moduleName, false)

}
module.exports.login = Login

async function Search(user, password, skus, proxy) {
  let result = []
  let $ = ""
  const test = await Login(user, password, {})
  if (!test.Authenticated) {
    result.push(dto.webspider_data_result(moduleName, "", "", "", "",
      util.format("Login %s errata per %s", moduleName, user), "0.0", "", "", ""))
    return result
  }
  for (let i = 0; i < skus.length; i++) {
    let search_call = await axios({
      method: "get",
      url: "https://autospeed.es/busqueda?controller=search&s=" + skus[i],
      headers: {
        "Host": "autospeed.es",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Referer": "https://autospeed.es/",
        "Cookie": biscuit,
        "Upgrade-Insecure-Requests": "1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "TE": "Trailers"
      }
    })
    $ = cheerio.load(search_call.data)
    await push($, skus[i])
  }
  return search_result
}

module.exports.search = Search

