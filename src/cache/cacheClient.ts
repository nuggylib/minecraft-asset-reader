import { CACHE } from "../main"
import { MinecraftAssetReader } from "../minecraft/minecraftAssetReader"
import {
  readBlockstates,
  readModels,
  readTextures,
} from "../minecraft/readBlockData"
import { RawAssetData } from "../types"

/**
 * Client class to help with more complicated cache operations
 */
class CacheClient {
  minecraftAssetReader: MinecraftAssetReader

  constructor() {
    this.minecraftAssetReader = new MinecraftAssetReader()
  }

  /**
   * Add the raw data to the redis store
   *
   * @param rawAssetsData
   */
  async setRawData(rawAssetsData: RawAssetData) {
    // The raw data in the cache
    let rawData = await CACHE.getRawDataFromCache()
    const rootAssetsPath = await CACHE.getRootAssetsPath()
    // The namespaces detected in the raw data passed-in to this method (NOT the data from the cache)
    const namespaces = Object.keys(rawAssetsData)
    // If you're using this tool with a vanilla Minecraft installation,
    // there will be only one namespace: minecraft. There may be more
    // namespaces in circumstances, such as mod packs. In which case,
    // there will be a namespace for each mod.
    namespaces.forEach((namespace) => {
      rawData = {
        [namespace]: {
          blockstates: readBlockstates({
            namespace: namespace,
            path: rootAssetsPath!,
          }),
          model: readModels({
            namespace: namespace,
            path: rootAssetsPath!,
          }),
          texture: readTextures({
            namespace: namespace,
            path: rootAssetsPath!,
          }),
        },
      }
    })
    await CACHE.setCachedRawData(rawData)
  }

  /**
   * Parses imported raw data into base site page content
   */
  async parseImportedData() {
    await this.minecraftAssetReader.parseRawData()
  }
}

export const CACHE_CLIENT = new CacheClient()
