process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let spider = require("../webspider/autofrance")


spider.search("", "", ['88086'],
  { token: "" }).then(r => console.log(r))