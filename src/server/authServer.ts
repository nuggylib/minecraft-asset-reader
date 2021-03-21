import express from "express"
import bodyParser from "body-parser"
import { contentfulOauthRedirect } from "./authRoutes/contentful/redirect";
import { contentfulOauthCallback } from "./authRoutes/contentful/callback";
import { Tunnel } from "./tunnel";

export class AuthServer {
    app: express.Express
    tunnel: Tunnel
    triggerReRenderHandler: any
    constructor({ triggerReRenderHandler }: { triggerReRenderHandler: any }) {
        this.tunnel = new Tunnel()
        this.triggerReRenderHandler = triggerReRenderHandler
        this.app = express()
        // this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json())
    }

    async initTunnel() {
        return this.tunnel.initTunnel({
            port: 3000
        })
        .then(() => {
            this.triggerReRenderHandler({
                url: this.tunnel.getNgrokUrl()
            })
        })
    }

    initRoutes() {
        // Contentful routes
        this.app.get('/oauth/contentful', contentfulOauthRedirect({ ngrokUrl: this.tunnel.getNgrokUrl() }));
        this.app.post('/oauth/contentful', contentfulOauthCallback );
    }

    startServer() {
        // Start the underlying server
        this.app.listen(3000)
    }
}