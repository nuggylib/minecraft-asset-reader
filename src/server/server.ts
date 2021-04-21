import express from "express"
// import ngrok from "ngrok"
import paginate from "express-paginate"
import cors from "cors"
import {
  getNamespaces,
  setContentMapNamespaceBlocks,
  writeContentMapToDisk,
  getBlockFromContentMap,
  getBlocksForNamespace,
  getScaledAssetsForBlock,
  getContentMap,
} from "./routes"

// import {
//   getContentfulCMAToken,
//   setContentfulCMAToken,
// } from "../cms-client/contentful/contentful"
// import { contentfulOauthRedirect } from "./routes/contentful/redirect"
// import { contentfulOauthCallback } from "./routes/auth/contentful/callback"

var app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.post(`/content-map/blocks`, setContentMapNamespaceBlocks)
app.post(`/content-map/export`, writeContentMapToDisk)

app.use(paginate.middleware(10, 50))
app.get(`/raw-data/namespaces`, getNamespaces)
// app.get(`/raw-data/advancements`, null)
app.get(`/raw-data/blocks`, getBlocksForNamespace)
app.get(`/raw-data/blocks/scaled-images`, getScaledAssetsForBlock)
app.get(`/content-map`, getContentMap)
app.get(`/content-map/block`, getBlockFromContentMap)
// app.get(`/raw-data/items`, null)
// app.get(`/raw-data/recipes`, null)

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
  app.listen(3000)
  // return ngrok.connect(3000)
  return ``
}
