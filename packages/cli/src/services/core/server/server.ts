import express from "express"
// import ngrok from "ngrok"
import paginate from "express-paginate"
import cors from "cors"
import { getBlocksForNamespace, getNamespaces } from "../../../api/raw-data"
import {
  getBlockFromContentMap,
  getContentMap,
  setContentMapNamespaceBlocks,
  writeContentMapToDisk,
} from "../../../api/content-map"
import { writeSiteDataToDisk, exportToSanity } from "../../../api/site-data"
import path from "path"

var app = express()

// Needed for React app
app.use(express.static(path.join(__dirname, `../../../..`, `build`)))
app.use(express.static(`public`))

// Remaining stuff
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use(paginate.middleware(10, 50))

/*******************************************
 * Raw data routes
 *******************************************/
app.get(`/raw-data/namespaces`, getNamespaces)
app.get(`/raw-data/blocks`, getBlocksForNamespace)

/*******************************************
 * Content map routes
 *******************************************/
app.get(`/content-map`, getContentMap)
app.get(`/content-map/block`, getBlockFromContentMap)
app.post(`/content-map/blocks`, setContentMapNamespaceBlocks)
app.post(`/content-map/export`, writeContentMapToDisk)

/*******************************************
 * Site data routes
 *******************************************/
app.post(`/site-data/export`, writeSiteDataToDisk)
app.post(`/site-data/export/sanity`, exportToSanity)

export async function initServer() {
  app.listen(3000)
  return ``
}
