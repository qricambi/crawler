const axios = require('axios')
const cheerio = require('cheerio')
const _ = require("lodash")
const util = require("util")
const querystring = require("querystring")
const dto = require("../lib/dto")
const moduleName = require("../lib/sys").ModuleName(__filename)
const a_status = require("../lib/avalability_status")
const START_URL = ""


async function Login(user, password) {
    const first_call = await axios({
        method: "get",
        url: "https://sklep.auto-france.com.pl/zaloguj-sie?returnUrl=%2F&hw-lang=it-IT",
        headers: {
            'Host': "sklep.auto-france.com.pl",
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            'Accept-Language': "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
            'Accept-Encoding': "gzip, deflate, br",
            'Connection': "keep-alive",
            'Cookie': "lang=en-US",
            'Upgrade-Insecure-Requests': "1",
            'Pragma': "no-cache",
            'Cache-Control': "no-cache"
        }

    })
    first_call.data.trim()
    let $ = cheerio.load(first_call.data)
    let token = $("input[name='__RequestVerificationToken']").attr("value")
    let data = {
        "Username": user,
        "Password": password,
        "RememberMe": "field-binded",
        "__RequestVerificationToken": token
    }

    biscuit = first_call.headers['set-cookie']
    const second_call = await axios({
        method: "post",
        url: "https://sklep.auto-france.com.pl/api/stock-login-form-field",
        headers: {
            "Host": "sklep.auto-france.com.pl",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
            "Accept": "*/*",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Length": "243",
            "Origin": "https://sklep.auto-france.com.pl",
            "Connection": "keep-alive",
            "Referer" : "https://sklep.auto-france.com.pl/zaloguj-sie?returnUrl=%2F&hw-lang=it-IT",
            "Cookie" : biscuit, 
            "Pragma" : "no-cache",
            "Cache-Control" : "no-cache",
            "TE": "Trailers"

        },
        data: querystring.stringify(data)
        
    })
    console.log('bella lì')


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
}

module.exports.login = Login

module.exports.search = Search
