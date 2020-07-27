let axios = require("axios")
let http = require("http")
let https = require("https")
let httpsAgentObject = require("https-proxy-agent")
let net = require("net")
let url = require("url")
const dns = require("dns")
let fs = require("fs")

if(!process.env.QfrpServerIp){
  console.log("QfrpServerIp non impostata")
  process.exit(1)
}

let remotehost = process.env.QfrpServerIp.split(":")[0]
let remoteport = process.env.QfrpServerIp.split(":")[1]
/* let remotehost = "127.0.0.1"
let remoteport = 10111  */

function createSocket(token){
  return function(){
    let socket = net.connect(remoteport, remotehost)
    socket.write(token)    
    return socket
  }
}

function create(configs){
  configs = configs || {}
  configs["proxy"] = null
  let sslTunnel = true
  if ( configs.sslTunnel === false ) sslTunnel = false
  if(!(configs.headers || {})["QTokenApi"])
    return axios.create(configs)
  let httpAgent = new http.Agent({ keepAlive: false})
  // eslint-disable-next-line no-constant-condition
  let httpsAgent = sslTunnel ? new httpsAgentObject({ keepAlive: false}) : new https.Agent({ keepAlive: false})
  httpAgent.createConnection = createSocket(configs.headers["QTokenApi"])
  httpsAgent.createConnection = createSocket(configs.headers["QTokenApi"])    
  configs["httpAgent"] = httpAgent
  configs["httpsAgent"] = httpsAgent
    
  delete configs.headers["QTokenApi"]
  let instance = axios.create(configs)
  instance.interceptors.request.use(function(cfgs){
    if(!(/^https:?$/i.test(url.parse(cfgs.url).protocol))){
      cfgs["proxy"] = { host: remotehost, port: remoteport }
      cfgs.headers.Requestprotocol = "http"
    }else{
      // eslint-disable-next-line no-constant-condition
      // cfgs["proxy"] = sslTunnel ? false : { host: remotehost, port: remoteport }
      cfgs.headers.Requestprotocol = "https"
    }
    return cfgs
  })
  return instance
}

module.exports.create = create