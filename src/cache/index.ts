import { ConfiguredBlock, ContentMap, RawAssetData, SiteData } from "../types"
import NodeCache from "node-cache"
import {
  CONTEXT_PATTERN_QUALITY,
  MinecraftBlockRenderer,
} from "../minecraft/minecraftBlockRenderer"
import fs from "fs"
import mkdirp from "mkdirp"
import { loadImage } from "canvas"

const enum KEYS {
  CONTENT_MAP = `content_map`,
  RAW_DATA = `raw_data`,
  PARSED_DATA = `parsed_data`,
  ASSETS_PATH = `assets_path`,
}

// TODO: Implement this patter for all internal APIs; need to do a lot of cleanup and standardization
type MutationResult = {
  success: boolean
  message?: string
}

export default class AppCache {
  blockRenderer
  cache

  constructor() {
    this.cache = new NodeCache()
    this.blockRenderer = new MinecraftBlockRenderer()
  }

  getRawData(): RawAssetData {
    const rawData = this.cache.get(KEYS.RAW_DATA)
    if (rawData) {
      return rawData as RawAssetData
    }
    return (null as unknown) as RawAssetData
  }

  async getScaledBlockTextures(args: {
    namespace: string
    block: string
    scaleAmount: number
  }) {
    const rawData = await this.getRawData()
    const rawBlockData = rawData[args.namespace].model.block[args.block]
    const scaledTextures = {} as {
      [key: string]: string
    }

    await mkdirp(`./generated/scaled_images`)

    await Promise.all(
      Object.keys(rawBlockData.textures!).map(async (textureKey) => {
        if (!rawBlockData.textures![textureKey]?.includes(`#`)) {
          const origImgBase64 = rawBlockData.textures![textureKey]
          const prunedBase64 = origImgBase64?.replace(
            `data:image/png;base64,`,
            ``
          )
          const imgBuff = Buffer.from(prunedBase64!, `base64`)
          const baseImage = await loadImage(imgBuff)

          const canvas = await this.blockRenderer.scale({
            sourceImage: baseImage,
            scale: args.scaleAmount,
            patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
          })
          scaledTextures[
            textureKey
          ] = `data:image/png;base64,${canvas.toBuffer().toString(`base64`)}`
        }
      })
    )

    return scaledTextures
  }

  getContentMap(): ContentMap {
    const contentMap = this.cache.get(KEYS.CONTENT_MAP)
    if (contentMap) {
      return contentMap as ContentMap
    }
    return (null as unknown) as ContentMap
  }

  async writeContentMapToDisk(args: {
    path?: string
  }): Promise<MutationResult> {
    try {
      let baseWritePath = `./generated/export`
      if (args.path) {
        baseWritePath = args.path
      }
      const cachedContentMap = this.getContentMap()
      await mkdirp(baseWritePath) // creates the path if it doesn't exist already
      fs.writeFileSync(
        `${baseWritePath}/content_map.json`,
        JSON.stringify(cachedContentMap)
      )
      return {
        success: true,
        message: `Content map saved successfully`,
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      }
    }
  }

  updateContentMapBlocksForNamespace(args: {
    namespace: string
    blocks: {
      [block: string]: ConfiguredBlock
    }
  }) {
    let cachedContentMap = this.getContentMap()
    if (!cachedContentMap) {
      cachedContentMap = {}
    }
    if (!cachedContentMap[args.namespace]) {
      cachedContentMap[args.namespace] = {
        blocks: {},
      }
    }
    let newBlocks = cachedContentMap[args.namespace].blocks
    Object.keys(args.blocks).forEach((blockKey) => {
      newBlocks[blockKey] = args.blocks[blockKey]
    })
    const newCachedContentMap = {
      ...cachedContentMap,
      [args.namespace]: {
        blocks: newBlocks,
      },
    } as ContentMap

    this.cache.set(KEYS.CONTENT_MAP, newCachedContentMap)
  }

  getSiteData(): SiteData {
    const parsedData = this.cache.get(KEYS.PARSED_DATA)
    if (parsedData) {
      return parsedData as SiteData
    }
    return (null as unknown) as SiteData
  }

  setCachedRawData(updatedRawDataObject: RawAssetData) {
    const cachedRawData = this.getRawData()
    const updatedRawData = {
      ...cachedRawData,
      ...updatedRawDataObject,
    } as RawAssetData

    this.cache.set(KEYS.RAW_DATA, updatedRawData)
  }

  /**
   * Update the cached parsed data with the given parsed data object
   *
   * This method handles merging the data from the "old" parsed data
   * with the updated one, so that data is not overwritten and kept
   * up-to-date.
   *
   * @param updatedParsedDataObject
   * @returns
   */
  setCachedSiteData(updatedParsedDataObject: SiteData) {
    const cachedParsedData = this.getSiteData()

    const updatedParsedData = {
      ...cachedParsedData,
      ...updatedParsedDataObject,
    } as SiteData
    const response = this.cache.set(KEYS.PARSED_DATA, updatedParsedData)
    return response
  }

  setRootAssetsPath(rootAssetsPath: string) {
    return this.cache.set(KEYS.ASSETS_PATH, rootAssetsPath)
  }

  getRootAssetsPath() {
    return this.cache.get(KEYS.ASSETS_PATH)
  }
}
