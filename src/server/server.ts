import express from "express"
import bodyParser from "body-parser"
import ngrok from "ngrok"
import { getContentfulCMAToken, setContentfulCMAToken } from "../cms-client/contentful/contentful";
import { contentfulOauthRedirect } from "./authRoutes/contentful/redirect";
import { contentfulOauthCallback } from "./authRoutes/contentful/callback";

// var app = express()

// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json())

// app.get('/oauth/contentful', function(req, res) { contentfulOauthRedirect(req, res) });
// app.post('/oauth/contentful', function(req, res) { contentfulOauthCallback(req, res) });

/**
 * Initializes the underlying express app, then starts an ngrok tunnel on the same port.
 * 
 * The resulting HTTPS URL should be used whenever you need to provide an HTTPS redirect
 * address. This server is technically overkill for providers that are less strict, but we
 * use this method either way for simplicity.
 */
export async function initServer() {
    // app.listen(3000)
    // return ngrok.connect(3000)
    return ``
}

