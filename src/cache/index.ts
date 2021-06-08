import NodeCache from "node-cache"
import {
  CONTEXT_PATTERN_QUALITY,
  MinecraftBlockRenderer,
} from "../minecraft/minecraftBlockRenderer"
import {
  ITEM_CONTEXT_PATTERN_QUALITY,
  MinecraftItemRenderer,
} from "../minecraft/minecraftItemRenderer"
import { loadImage } from "canvas"
import { RawAssetData } from "../types/cache"
import { Int } from "../types/shared"
import { BlockModelData, ItemModelData } from "../types/minecraft"

const enum KEYS {
  CONTENT_MAP = `content_map`,
  RAW_DATA = `raw_data`,
  SITE_DATA = `site_data`,
  ASSETS_PATH = `assets_path`,
  GAME_VERSION = `game_version`,
}

export default class AppCache {
  blockRenderer
  itemRenderer
  cache

  constructor() {
    this.cache = new NodeCache()
    this.blockRenderer = new MinecraftBlockRenderer()
    this.itemRenderer = new MinecraftItemRenderer()
  }

  rawData(): RawAssetData {
    const rawData = this.cache.get(KEYS.RAW_DATA)
    if (rawData) {
      return rawData as RawAssetData
    }
    return null as unknown as RawAssetData
  }

  getPaginatedRawBlocksForNamespace = (args: {
    namespace: string
    page?: Int
    limit?: Int
    order?: `ascending` | `descending`
    q?: string
  }) => {
    const { limit, namespace, page } = args
    const rawData = this.rawData()
    const records = [] as {
      block: string
      data: BlockModelData
    }[]
    const blocksForNamespace = rawData[namespace].model.block
    let blockNames = [] as string[]
    if (!!args.q) {
      blockNames = Object.keys(blocksForNamespace).filter((val) =>
        val.includes(args.q!)
      )
    } else {
      blockNames = Object.keys(blocksForNamespace)
    }

    if (!!args.order && args.order === `descending`) {
      blockNames.reverse()
    }
    const pageCount = Math.ceil(
      blockNames.length / (limit as unknown as number)
    )
    let pageNum = 1
    if (!!page) {
      pageNum = parseInt(page as unknown as string)
    }
    const limitNum = parseInt(limit as unknown as string)
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

  getPaginatedRawItemsForNamespace = (args: {
    namespace: string
    page?: Int
    limit?: Int
    order?: `ascending` | `descending`
    q?: string
  }) => {
    const { limit, namespace, page } = args
    const rawData = this.rawData()
    const records = [] as {
      item: string
      data: ItemModelData
    }[]
    const itemsForNamespace = rawData[namespace].model.item
    let itemNames = [] as string[]
    if (!!args.q) {
      itemNames = Object.keys(itemsForNamespace).filter((val) =>
        val.includes(args.q!)
      )
    } else {
      itemNames = Object.keys(itemsForNamespace)
    }

    if (!!args.order && args.order === `descending`) {
      itemNames.reverse()
    }
    const pageCount = Math.ceil(itemNames.length / (limit as unknown as number))
    let pageNum = 1
    if (!!page) {
      pageNum = parseInt(page as unknown as string)
    }
    const limitNum = parseInt(limit as unknown as string)
    const paginatedItemNames = itemNames.slice(
      pageNum * limitNum - limitNum,
      pageNum * limitNum
    )
    paginatedItemNames.forEach((itemName) => {
      records.push({
        item: itemName,
        data: itemsForNamespace[itemName],
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
          scaledTextures[textureKey] = `data:image/png;base64,${canvas
            .toBuffer()
            .toString(`base64`)}`
        }
      })
    )

    return scaledTextures
  }

  async getScaledItemTextures(args: {
    namespace: string
    item: string
    scaleAmount: number
  }) {
    const rawData = this.rawData()
    const rawItemData = rawData[args.namespace].model.block[args.item]
    const scaledTextures = {} as {
      [key: string]: string
    }

    await Promise.all(
      Object.keys(rawItemData.textures!).map(async (textureKey) => {
        if (!rawItemData.textures![textureKey]?.includes(`#`)) {
          const origImgBase64 = rawItemData.textures![textureKey]
          const prunedBase64 = origImgBase64?.replace(
            `data:image/png;base64,`,
            ``
          )
          const imgBuff = Buffer.from(prunedBase64!, `base64`)
          const baseImage = await loadImage(imgBuff)

          const canvas = await this.itemRenderer.scale({
            sourceImage: baseImage,
            scale: args.scaleAmount,
            patternQuality: ITEM_CONTEXT_PATTERN_QUALITY.FAST,
          })
          scaledTextures[textureKey] = `data:image/png;base64,${canvas
            .toBuffer()
            .toString(`base64`)}`
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

  async getItemDataWithScaledImages(args: {
    namespace: string
    item: string
    scaleAmount: number
  }) {
    const rawData = this.rawData()
    const rawItemData = rawData[args.namespace].model.item[args.item]
    return {
      data: rawItemData,
      scaledTextures: await this.getScaledItemTextures(args),
    }
  }

  setCachedRawData(updatedRawDataObject: RawAssetData) {
    const cachedRawData = this.rawData()
    const updatedRawData = {
      ...cachedRawData,
      ...updatedRawDataObject,
    } as RawAssetData

    this.cache.set(KEYS.RAW_DATA, updatedRawData)
  }

  setRootAssetsPath(rootAssetsPath: string) {
    return this.cache.set(KEYS.ASSETS_PATH, rootAssetsPath)
  }

  getRootAssetsPath() {
    return this.cache.get(KEYS.ASSETS_PATH)
  }

  setCachedGameVersion(version: string) {
    return this.cache.set(KEYS.GAME_VERSION, version)
  }

  getCachedGameVersion(): string {
    return this.cache.get(KEYS.GAME_VERSION) as string
  }
}
