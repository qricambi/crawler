const Logging = require("@google-cloud/logging")
const _ = require("lodash")
const logging = new Logging({
  // projectId: 'qricambi',
  keyFilename: "key.json",
})
const log = logging.log("qcrawler-" + (process.env.environment || "testdevelopment"))

module.exports = function (error, req, otherData) {
  // Selects the log to write to
  let jsonPayload = {}

  // The data to write to the log
  let request = Object.assign({}, req)

  const text = error.stack
  // The metadata associated with the entry
  let request_params = req ? {
    "requestMethod": request["method"],
    "requestUrl": request["originalUrl"],
    "userAgent": req.header("user-agent"),
    "referer": req.header("referer"),
    "body": request["body"]
  } : {}
  const metadata = {
    resource: {
      labels: {
        project_id: "qricambi"
      },
      type: "global"
    },
    serviceContext: {
      service: "qcrawler-" + (process.env.environment || "testdevelopment")
    },
    context: {
      httpRequest: request_params
    },
    otherData: otherData,
    message: text
  }
  // Prepares a log entry
  const entry = log.entry(metadata, null)
  log.error(entry).catch(function (err) {
    console.log(err)
  }).then(function (resp) {
    console.log(resp)
  })
}