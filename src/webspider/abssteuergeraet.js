const axios = require('axios')
const cheerio = require('cheerio')
const _ = require("lodash")
const util = require("util")
const querystring = require("querystring")
const dto = require("../lib/dto")
const moduleName = require("../lib/sys").ModuleName(__filename)
const a_status = require("../lib/avalability_status")
const START_URL = ""

let biscuit = [];


async function Login(user, password) {
    const first_call = await axios({
        url: "https://www.abssteuergeraet.eu/it/",
        method: "GET",
        headers: {
            "Host": "www.abssteuergeraet.eu",
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

    first_call.data.trim()
    let $ = cheerio.load(first_call.data)
    let return_url = $("input[name='return_url']").attr("value")
    let return_url_hash = $("input[name='return_url_hash']").attr("value")

    let data = {
        "return_url": return_url,
        "return_url_hash": return_url_hash,
        "pass": password,
        "user": user,
    }
    biscuit = first_call.headers['set-cookie']

    const second_call = await axios({
        url: 'https://www.abssteuergeraet.eu/it/login.php?action=process',
        data: querystring.stringify(data),
        method: "POST",
        headers: {
            "Host": "www.abssteuergeraet.eu",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": "191",
            "Origin": "https://www.abssteuergeraet.eu",
            "DNT": "1",
            "Connection": "keep-alive",
            "Referer": "https://www.abssteuergeraet.eu/it/",
            "Cookie": biscuit,
            "Upgrade-Insecure-Requests": "1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"

        },
        maxRedirects: 0,
        validateStatus: function (status) {
            return (status >= 200 && status <= 303)
        }

    })
    if (second_call.data.success) {
        biscuit = biscuit.concat(second_call.headers['set-cookie'])
        console.log("login OK");
        return dto.check_login_result(moduleName, true)
    }
    else {
        console.log("login KO");
        return dto.check_login_result(moduleName, false)
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
            method: "get",
            url: "https://www.abssteuergeraet.eu/it/advanced_search_result.php?categories_id=0&keywords=" + skus[index] + "&inc_subcat=1",
            headers: {
                "Host": "www.abssteuergeraet.eu",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Referer": "https://www.abssteuergeraet.eu/it/login.php?action=process",
                "Cookie": biscuit,
                "Upgrade-Insecure-Requests": "1",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }
        })

        let $ = cheerio.load(third_call.data)
        let rows = $(".content-container").children().get()
        for (const row of rows) {
            let price = $(row).find("span.current-price-container").text().trim().match(/([0-9,.]+)/gim)          
            let cod = $(row).find('div.shipping').first().clone().children().remove().end().text().replace(/[\t\n]+/g, "").trim()
            let desc = $(row).find(".title").text().trim()
            result.push(dto.webspider_data_result(
                moduleName,
                0,
                0,
                skus[index],
                "",//produttore
                "",
                cod.replace("Articolo n.:",""),//codice
                "",
                "",
                ($(row).find(".description").text() + " " + desc).replace(/[\t\n]+/g, "").trim(),//descrizione
                "",
                "",
                "",
                null,
                price ? price[0].replace(/\./gi, "") : "",//prezzo
                null,
                null,
                status($(row).find('div.shipping-info-short').children().attr("src"),
                $(row).find('div.shipping-info-short').first().text().replace(/[\t\n]+/g, "").trim()
                 + " " +
                 $(row).find('span.products-details-weight-container').text().replace(/[\t\n]+/g, "").trim()), //status(), //disponibilità
                $(row).find(".product-url").attr("href") //link

            )) 
        }
    }
    return result
}


function status(st,des) {
    if(st.includes("images/icons/status/red.png"))
        return {
            code: a_status.not_available,
            desc: des
        }
    else if (st.includes("images/icons/status/green.png"))
        return {
            code: a_status.available,
            desc: des
        }
    else
        return {
            code: a_status.other,
            desc: des
        }
}

module.exports.login = Login

module.exports.search = Search

