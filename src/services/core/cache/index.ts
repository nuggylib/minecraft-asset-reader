import NodeCache from "node-cache"
import {
  CONTEXT_PATTERN_QUALITY,
  MinecraftBlockRenderer,
} from "../../minecraft/minecraftBlockRenderer"
import fs from "fs"
import mkdirp from "mkdirp"
import { loadImage } from "canvas"
import { ConfiguredBlock, ContentMap, RawAssetData } from "../../../types/cache"
import { SiteData } from "../../../types/export"
import { Int, MutationResult } from "../../../types/shared"
import { BlockModelData } from "../../../types/minecraft"

const enum KEYS {
  CONTENT_MAP = `content_map`,
  RAW_DATA = `raw_data`,
  SITE_DATA = `site_data`,
  ASSETS_PATH = `assets_path`,
}

export default class AppCache {
  blockRenderer
  cache

  constructor() {
    this.cache = new NodeCache()
    this.blockRenderer = new MinecraftBlockRenderer()
  }

  rawData(): RawAssetData {
    const rawData = this.cache.get(KEYS.RAW_DATA)
    if (rawData) {
      return rawData as RawAssetData
    }
    return (null as unknown) as RawAssetData
  }

  getPaginatedRawBlocksForNamespace = (args: {
    namespace: string
    page?: Int
    limit?: Int
  }) => {
    const {
      limit,
      namespace,
      page,
    } = args
    const rawData = this.rawData()
    const records = [] as {
      block: string
      data: BlockModelData
    }[]
    const blocksForNamespace = rawData[namespace].model.block
    const blockNames = Object.keys(blocksForNamespace)
    const pageCount = Math.ceil(
      blockNames.length / ((limit as unknown) as number)
    )
    let pageNum = 1
    if (!!page) {
      pageNum = parseInt((page as unknown) as string)
    }
    const limitNum = parseInt((limit as unknown) as string)
    const paginatedBlockNames = blockNames.slice(
      pageNum * limitNum - limitNum,
      pageNum * limitNum
    )
    paginatedBlockNames.forEach((blockName) => {
      records.push({
        block: blockName,
        data: blocksForNamespace[blockName],
      })
    })
    return {
      records,
      pageCount,
    }
  }

  async getScaledBlockTextures(args: {
    namespace: string
    block: string
    scaleAmount: number
  }) {
    const rawData = this.rawData()
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

  async getBlockDataWithScaledImages(args: {
    namespace: string
    block: string
    scaleAmount: number
  }) {

    const rawData = this.rawData()
    const rawBlockData = rawData[args.namespace].model.block[args.block]
    return {
      data: rawBlockData,
      scaledTextures: await this.getScaledBlockTextures(args),
    }

  }

  contentMap(): ContentMap {
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
      const cachedContentMap = this.contentMap()
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
    let cachedContentMap = this.contentMap()
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

  siteData(): SiteData {
    const siteData = this.cache.get(KEYS.SITE_DATA)
    if (siteData) {
      return siteData as SiteData
    }
    return (null as unknown) as SiteData
  }

  setCachedRawData(updatedRawDataObject: RawAssetData) {
    const cachedRawData = this.rawData()
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
    const cachedParsedData = this.siteData()

    const updatedParsedData = {
      ...cachedParsedData,
      ...updatedParsedDataObject,
    } as SiteData
    const response = this.cache.set(KEYS.SITE_DATA, updatedParsedData)
    return response
  }

  setRootAssetsPath(rootAssetsPath: string) {
    return this.cache.set(KEYS.ASSETS_PATH, rootAssetsPath)
  }

  getRootAssetsPath() {
    return this.cache.get(KEYS.ASSETS_PATH)
  }
}
