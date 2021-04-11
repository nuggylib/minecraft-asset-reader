import { ParsedData, RawAssetData } from "../types"
import NodeCache from "node-cache"

const enum KEYS {
  RAW_DATA = `raw_data`,
  PARSED_DATA = `parsed_data`,
  ASSETS_PATH = `assets_path`,
}

export default class AppCache {
  // The client to facilitate interactions with the underlying redis store
  // redisClient = new CacheClient()
  // diskCache
  cache

  constructor() {
    this.cache = new NodeCache()

    // this.redisClient = new CacheClient()

    let parsedData: ParsedData
    let rawData: RawAssetData

    parsedData = {}
    rawData = {}
  }

  // TODO: Test this later to see if we can remove this - Redis may be more flexible than the react state
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
    // const res = this.diskCache.set(
    //   KEYS.PARSED_DATA,
    //   this.convertJsonToBase64({ json: parsedData }),
    // )
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
  convertJsonToBase64(args: { json: RawAssetData | ParsedData }) {
    return Buffer.from(JSON.stringify(args.json)).toString(`base64`)
  }

  async getRawDataFromCache(): Promise<RawAssetData> {
    const rawDataBase64 = (await this.cache.get(KEYS.RAW_DATA)) as string
    if (rawDataBase64) {
      return this.convertBase64StringToJson({
        jsonBase64: rawDataBase64,
      })
    }
    return (null as unknown) as RawAssetData
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

    const response = await this.cache.set(KEYS.RAW_DATA, updatedRawDataBase64)
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
