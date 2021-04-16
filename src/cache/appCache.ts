import { ConfiguredBlock, ContentMap, ParsedData, RawAssetData } from "../types"
import NodeCache from "node-cache"
import sharp from "sharp"
import {
  CONTEXT_PATTERN_QUALITY,
  MinecraftBlockRenderer,
} from "../minecraft/minecraftBlockRenderer"
import fs from "fs"
import mkdirp from "mkdirp"
import { createCanvas, Image, loadImage } from "canvas"

const enum KEYS {
  CONTENT_MAP = `content_map`,
  RAW_DATA = `raw_data`,
  PARSED_DATA = `parsed_data`,
  ASSETS_PATH = `assets_path`,
}

export default class AppCache {
  blockRenderer
  cache

  constructor() {
    this.cache = new NodeCache()
    this.blockRenderer = new MinecraftBlockRenderer()
  }

  async initContentMap() {}

  /**
   * Initilizes the base object in the cache for the given namespace.
   */
  async initNamespaceParsedDataObject(args: { namespace: string }) {
    console.log(
      `Initializing namespace data structure for namespace: '${args.namespace}'`
    )

    let parsedData = await this.getParsedDataFromCache()

    parsedData = {
      [args.namespace]: {},
    }
    parsedData = {
      [args.namespace]: {
        blockPages: [],
        itemPages: [],
      },
    }

    // Add the base-64 strings for the JSON objects
    const res = this.cache.set(
      KEYS.PARSED_DATA,
      this.convertJsonToBase64({ json: parsedData })
    )

    return res
  }

  /**
   * Converts a Base64 string to a JSON object
   *
   * @param args
   */
  convertBase64StringToJson(args: { jsonBase64: string }) {
    const buffer = Buffer.from(args.jsonBase64, `base64`)
    const jsonString = buffer.toString(`utf-8`)
    return JSON.parse(jsonString)
  }

  /**
   * Converts a JSON object to a Base64 string
   *
   * @param args
   */
  convertJsonToBase64(args: { json: RawAssetData | ParsedData | ContentMap }) {
    return Buffer.from(JSON.stringify(args.json)).toString(`base64`)
  }

  async getRawDataFromCache(): Promise<RawAssetData> {
    const rawDataBase64 = (await this.cache.get(KEYS.RAW_DATA)) as string
    if (rawDataBase64) {
      return this.convertBase64StringToJson({
        jsonBase64: rawDataBase64,
      }) as RawAssetData
    }
    return (null as unknown) as RawAssetData
  }

  async getScaledBlockTextures(args: {
    namespace: string
    block: string
    scaleAmount: number
  }) {
    const rawData = await this.getRawDataFromCache()
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

  async getContentMapFromCache(): Promise<ContentMap> {
    const rawDataBase64 = (await this.cache.get(KEYS.CONTENT_MAP)) as string
    if (rawDataBase64) {
      return this.convertBase64StringToJson({
        jsonBase64: rawDataBase64,
      }) as ContentMap
    }
    return (null as unknown) as ContentMap
  }

  async updateContentMapBlocksForNamespace(args: {
    namespace: string
    blocks: {
      [block: string]: ConfiguredBlock
    }
  }) {
    const cachedContentMap = await this.getContentMapFromCache()
    const newCachedContentMap = {
      ...cachedContentMap,
      [args.namespace]: {
        blocks: {
          ...cachedContentMap[args.namespace].blocks,
          ...args.blocks,
        },
      },
    } as ContentMap

    const updatedContentMapBase64 = this.convertJsonToBase64({
      json: newCachedContentMap,
    })

    await this.cache.set(KEYS.CONTENT_MAP, updatedContentMapBase64)
  }

  async getParsedDataFromCache(): Promise<ParsedData> {
    const parsedDataBase64 = (await this.cache.get(KEYS.PARSED_DATA)) as string
    if (parsedDataBase64) {
      return this.convertBase64StringToJson({
        jsonBase64: parsedDataBase64,
      })
    }
    return (null as unknown) as ParsedData
  }

  async setCachedRawData(updatedRawDataObject: RawAssetData) {
    const cachedRawData = await this.getRawDataFromCache()
    const updatedRawData = {
      ...cachedRawData,
      ...updatedRawDataObject,
    } as RawAssetData
    const updatedRawDataBase64 = this.convertJsonToBase64({
      json: updatedRawData,
    })

    await this.cache.set(KEYS.RAW_DATA, updatedRawDataBase64)
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
  async setCachedParsedData(updatedParsedDataObject: ParsedData) {
    const cachedParsedData = await this.getParsedDataFromCache()

    const updatedParsedData = {
      ...cachedParsedData,
      ...updatedParsedDataObject,
    } as ParsedData
    const updatedParsedDataBase64 = this.convertJsonToBase64({
      json: updatedParsedData,
    })
    const response = await this.cache.set(
      KEYS.PARSED_DATA,
      updatedParsedDataBase64
    )
    return response
  }

  async setRootAssetsPath(rootAssetsPath: string) {
    return await this.cache.set(KEYS.ASSETS_PATH, rootAssetsPath)
  }

  async getRootAssetsPath() {
    return (await this.cache.get(KEYS.ASSETS_PATH)) as string
  }
}
