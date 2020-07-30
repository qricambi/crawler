const axios = require('axios')
const cheerio = require('cheerio')
const _ = require("lodash")
const util = require("util")
const querystring = require("querystring")
const dto = require("../lib/dto")
const moduleName = require("../lib/sys").ModuleName(__filename)
const a_status = require("../lib/avalability_status")
const {
  stat
} = require('fs')
const {
  get
} = require('http')
const START_URL = "https://hmenginesparts.nl"

async function Login(user, password) {
  const logincall = await axios({
    method: 'get',
    url: START_URL,
    headers: {
      'Host': 'hmenginesparts.nl',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    maxRedirects: 0,
    validateStatus: function (status) {
      return (status >= 200 && status <= 303)
    }
  })
  let $ = cheerio.load(logincall.data)
  let autdata = {
    'redirect_to': '/en/',
    'log': user,
    'pwd': password,
    'wp-submit': '',
    'trp-form-language': 'en'

  }
  autdata = querystring.stringify(autdata)
  console.log(autdata)
  let logincall2 = await axios({
    method: 'post',
    url: 'https://hmenginesparts.nl/wp-login.php',
    data: autdata,
    headers: {
      'Host': 'hmenginesparts.nl',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': ' it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://hmenginesparts.nl',
      'Connection': 'keep-alive',
      'Referer': 'https://hmenginesparts.nl/en/',
      'Upgrade-Insecure-Requests': '1',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    },
    maxRedirects: 0,
    validateStatus: function (status) {
      return (status >= 200 && status <= 303)
    }
  })
  if (logincall2.status == '200') {
    console.log('sbagliato')
    return dto.check_login_result(moduleName, false)
  } else {
    biscuit = logincall2.headers['set-cookie']
    biscuit = biscuit.map(x => x.split(';')[0])
    console.log('corretto')
    return dto.check_login_result(moduleName, true)
  }



}






async function Search(user, password, skus) {
  let result = []
  let $ = ""
  let proxy = {}
  const test = await Login(user, password, proxy)
  if (!test.Authenticated) {
    result.push(dto.webspider_data_result(moduleName, "", "", "", "",
      util.format("Login %s errata per %s", moduleName, user), "0.0", "", "", ""))
    return result
  }

  for (let index = 0; index < skus.length; index++) {
    const third_call = await axios({
      method: 'get',
      url: 'https://hmenginesparts.nl/en/?' +
        encodeURIComponent(JSON.stringify({
          "search_source": "any",
          "search_taxonomy": "product_cat",
          "include_terms_ids": "",
          "exclude_terms_ids": "",
          "exclude_posts_ids": "",
          "custom_fields_source": "",
          "results_order_by": "relevance",
          "results_order": "asc"
        })) +
        '&jet_ajax_search_categories=0&trp-form-language=en&s=' + skus[index],
      headers: {
        'Host': 'hmenginesparts.nl',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://hmenginesparts.nl/en/',
        'Cookie': biscuit,
        'Upgrade-Insecure-Requests': '1',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'

      },
    })
    let $ = cheerio.load(third_call.data);
    let container = $(".site-content").find('.search-entry-inner').get()


    for (const row of container) {

      let detailscall=await axios({
        url:$(row).find('.search-entry-title').children().attr('href'),
        method:'get',
        headers:{
          'Host': 'hmenginesparts.nl',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cookie':biscuit,
          'Upgrade-Insecure-Requests': '1',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'

        }
      })
      let $2=cheerio.load(detailscall.data)
      result.push(dto.webspider_data_result(
        moduleName,
        0,
        0,
        skus[index],
        '', //produttore
        "",
        $2('.sku').text().trim(), //codice
        "",
        "",
        $2(".page-header-title.clr").text().trim(), //descrizione
        "",
        "",
        "",
        null,
        $2('.summary.entry-summary').find(".woocommerce-Price-amount.amount").first().text().trim().replace(/[^0-9,.]+/g, ""), //prezzo
        null,
        null,
        status($2(".stock.in-stock").text()), //disponibilità
        'https://hmenginesparts.nl'+detailscall.request.path//link

      ))
      console.log('3')
    }

  }
  console.log('ciao')
}

function status(param) {
  param = param.replace(/[^0-9,.]+/g, '')
  param = parseInt(param)
  if (param==0||param=='') {

      return {
        code: a_status.not_available,
        desc: "not available " + param + ""
      }
    } else if(param>=5) {

    return {
        code: a_status.available,
        desc: "available " + param + ""
      }
    }
    else{
      return {
        code: a_status.other,
        desc: "few left " + param + ""
      }
    }

}
module.exports.login = Login

module.exports.search = Search
