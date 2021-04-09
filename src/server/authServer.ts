import express from "express"
import bodyParser from "body-parser"
import { contentfulOauthRedirect } from "./authRoutes/contentful/redirect"
import { contentfulOauthCallback } from "./authRoutes/contentful/callback"
import { Tunnel } from "./tunnel"

export class AuthServer {
  app: express.Express
  tunnel: Tunnel
  constructor() {
    this.tunnel = new Tunnel()
    this.app = express()
    // this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json())
  }

  async initTunnel(handleUrlChange: any) {
    return this.tunnel
      .initTunnel({
        port: 3000,
      })
      .then(() => {
        handleUrlChange(this.tunnel.getNgrokUrl())
      })
      .catch((e) => {
        console.error(`Unable to handle URL update: `, e)
      })
  }

  initRoutes() {
    // Contentful routes
    this.app.get(
      `/oauth/contentful`,
      contentfulOauthRedirect({ ngrokUrl: this.tunnel.getNgrokUrl() })
    )
    this.app.post(`/oauth/contentful`, contentfulOauthCallback)
  }

  startServer() {
    // Start the underlying server
    this.app.listen(3000)
  }
}
