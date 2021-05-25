import express from "express"
// import ngrok from "ngrok"
import paginate from "express-paginate"
import cors from "cors"
import { getBlocksForNamespace, getNamespaces } from "../api/raw-data"
import {
  getBlockFromContentMap,
  getContentMap,
  setContentMapNamespaceBlocks,
  writeContentMapToDisk,
} from "../api/content-map"
import { writeSiteDataToDisk, exportToSanity } from "../api/site-data"
import path from "path"
import { addOrUpdateBlock } from "../api/persistence/addOrUpdateBlock"
import { getBlocks } from "../api/persistence/getBlocks"
import { getHarvestTools } from "../api/persistence/getHarvestTools"
import { getHarvestToolQualities } from "../api/persistence/getHarvestToolQualities"
import { deleteBlock } from "../api/persistence/deleteBlock"
import { getImportedGameVersions } from "../api/persistence/getImportedGameVersions"
import { Dao } from "../db"
import { getCachedGameVersion } from "../api/session/getCachedGameVersion"
import { addNamespace } from "../api/persistence/addNamespace"
import { getNamespacesFromDb } from "../api/persistence/getNamespaces"
import { getHarvestToolsForBlock } from "../api/persistence/getHarvestToolsForBlock"
import { getHarvestToolQualitiesForBlock } from "../api/persistence/getHarvestToolQualitiesForBlock"

var app = express()

// Needed for React app
app.use(express.static(path.join(__dirname, `../../../..`, `build`)))
app.use(express.static(`public`))

// Remaining stuff
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

/**
 * Logging middleware - use this for debugging; for now, just uncomment it - eventually, this will be controlled with a flag
 */
app.use(`/`, (req, res, next) => {
  // TODO: Make this optional (e.g., only log when using something like a --debug flag)
  // if (req.body) {
  //   console.log(req.body)
  // }
  // if (req.query) {
  //   console.log(req.query)
  // }
  next()
})

/**
 * Middleware for all routes specific to imported data APIs
 *
 * This middleware does two things:
 * 1. Makes sure gameVersion is specified either in the body or query parameters (it doesn't care which)
 * 2. Checks if gameVersion is one that's been imported
 *
 * We need to perform the second check so that we don't call `Dao()` with the unknown game version; doing
 * so would create a junk .db file for game version that was given.
 */
app.use(`/imported`, (req, res, next) => {
  let ver: string | undefined
  // TODO: Make these mutually-exclusive (either body OR query)
  if (req.body) {
    ver = req.body.gameVersion as string | undefined
  }
  if (!!req.query && !ver) {
    const { gameVersion } = req.query
    ver = gameVersion as string | undefined
  }

  if (!ver) {
    res.status(422).send(`'gameVersion' parameter must be provided`)
    return
  }

  Dao()
    .then((db) => db.getImportedGameVersions())
    .then((versions) => {
      if (versions.includes(ver!)) {
        next()
      } else {
        res
          .status(422)
          .send(
            `Specified version has not been imported (there is no stored data for version '${ver}')`
          )
      }
    })
})

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
 * Core API routes
 *******************************************/
app.get(`/core/imported-versions`, getImportedGameVersions)

/*******************************************
 * Session API routes
 *******************************************/
app.get(`/session/game-version`, getCachedGameVersion)

/*******************************************
 * Game version-specific API routes
 *******************************************/
// Blocks
app.get(`/persistence/block`, getBlocks)
app.get(`/persistence/block/harvest-tools`, getHarvestToolsForBlock)
app.get(
  `/persistence/block/harvest-tool-qualities`,
  getHarvestToolQualitiesForBlock
)
app.post(`/persistence/block`, addOrUpdateBlock)
app.delete(`/persistence/block`, deleteBlock)
// Namespaces
app.get(`/persistence/namespace`, getNamespacesFromDb)
app.post(`/persistence/namespace`, addNamespace)

/*******************************************
 * Harvest Tool API routes
 *******************************************/
app.get(`/persistence/harvest-tool`, getHarvestTools)
app.get(`/persistence/harvest-tool/quality`, getHarvestToolQualities)

/*******************************************
 * Site data routes
 *******************************************/
app.post(`/site-data/export`, writeSiteDataToDisk)
app.post(`/site-data/export/sanity`, exportToSanity)

export async function initServer() {
  app.listen(3000)
  return ``
}
