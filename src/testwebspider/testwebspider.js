process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let spider = require("../webspider/hmenginesparts")


spider.search("gabriel@dipasport.com", "lellonedipa", ['04450'],
  { token: "" }).then(r => console.log(r))
