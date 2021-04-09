import fs from "fs"
import express from "express"
import https from "https"

var privateKey = fs.readFileSync(__dirname + `/sslcert/server.key`, `utf-8`)
var certificate = fs.readFileSync(__dirname + `/sslcert/server.crt`, `utf-8`)
var credentials = { key: privateKey, cert: certificate }

/**
 * Creates an HTTPS server to use when handling the callback from Contentful
 * OAuth
 */
export function createHttpsServer(): https.Server {
  var app = express()

  app.get(`/oauth`, function (req, res) {
    // TODO: intercept the hash value token - send it back to the server, save it in the server
    // see - https://stackoverflow.com/questions/17744003/get-url-after-in-express-js-middleware-request
    var template = `<script type="text/javascript"> 
            console.log(window.location.hash) 
            window.close()
        </script>`
    res.send(template)
  })

  return https.createServer(credentials, app)
}
