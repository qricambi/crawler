const axiosBase = require("./custom_axios_instance")
const _ = require("lodash")
var disable_images = process.env.DISABLE_DOWNLOAD_IMG || "true"

module.exports.ToBase64 = async (img_url, cookie, code = 200, proxy=false,axiosInstance=null,userAgent = null) => {
  if(!img_url)
    return ""
  let axios = axiosInstance || axiosBase.create({headers: {"QTokenApi": proxy.token}})
  if (disable_images === "true") {
    let headers = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate",
      "User-Agent": userAgent ? userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
    }
    if (!_.isUndefined(cookie) || !_.isEmpty(cookie))
      headers["Cookie"] = cookie
    const ris = await axios({
      method: "get",
      url: img_url,
      headers,
      responseType: "arraybuffer",
      maxRedirects: 0,
      validateStatus: function (status) {
        return (status >= 200 && status <= 302) ||  status === code
      },
    })
    
    return new Buffer(ris.data, "binary").toString("base64")
  }
  return ""
}