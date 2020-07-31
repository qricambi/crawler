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
        url: "http://shop.bomboleo.com/",
        method: "GET",
        headers: {
            "Host": "shop.bomboleo.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }
    })

    first_call.data.trim()
    let $ = cheerio.load(first_call.data)
    let csrf = $("input[name='csrf']").attr("value")
    let data = {
        "csrf": csrf,
        "pass": password,
        "user": user,
    }
    biscuit = first_call.headers['set-cookie']

    const second_call = await axios({
        url: 'http://shop.bomboleo.com/action_login.php',
        data: querystring.stringify(data),
        method: "POST",
        headers: {
            "Host": "shop.bomboleo.com",
            "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64; rv: 78.0) Gecko / 20100101 Firefox / 78.0",
            "Accept": "text / html, application / xhtml + xml, application / xml; q = 0.9, image / webp,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": "76",
            "Origin": "http://shop.bomboleo.com",
            "Connection": "keep-alive",
            "Referer": "http://shop.bomboleo.com/",
            "Cookie" : biscuit,
            "Upgrade-Insecure-Requests": "1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return (status >= 200 && status <= 303)
        }

    })
    if (second_call.headers['location'].includes("id=1")) {
        biscuit=biscuit.concat(second_call.headers['set-cookie'])
        console.log("login OK");
        return dto.check_login_result(moduleName, true)
    }
    else 
    {
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
            url: "http://shop.bomboleo.com/?id=308&psq=" + skus[index],
            headers: {
                "Host": "shop.bomboleo.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
                "Accept-Encoding": "gzip, deflate",
                "Referer": "http://shop.bomboleo.com/?id=308",
                "Connection": "keep-alive",
                "Cookie": biscuit,
                "Upgrade-Insecure-Requests": "1",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }
        })
        let $ = cheerio.load(third_call.data)
            let rows = $(".tblReferencias").get()
            rows  = rows.filter(x=>!$(x).attr('style').includes('none'))
            for (const row of rows) {
                result.push(dto.webspider_data_result(
                    moduleName,
                    0,
                    0,
                    skus[index],
                    "",//produttore
                    "",
                    $(row).find('').children("b").text(),//codice
                    "",
                    "",
                    $(row).find('div').text(),//descrizione
                    "",
                    "",
                    "",
                    null,
                    $(row).find('.desc').children().children().children().text().trim().match(/(^[0-9,.]+)/gim)[0],//prezzo
                    null,
                    null,
                    status($(row).find('[class*="stock"]')), //status(), //disponibilità
                    $(row).find('td').attr("href"), //link

                ))
            }
            //0 no disp rosso
            //>5 verde
            //0-5 giallo




    }
    
}


function status(st)
{   //let regex=(/(^[0-9,.]+)/gim)
    {
        st = st.replace('\n','')
        st = st.replace('>','').trim()
        return{
            code: a_status.available,
            desc: st + ""
        }

    }
    

}

module.exports.login = Login

module.exports.search = Search