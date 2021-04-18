import { readFileSync } from "fs"
import { CACHE } from "../main"
import { ContentMap, ParsedData } from "../types"
import {
  LIGHT_DIRECTION,
  MinecraftBlockRenderer,
} from "./minecraftBlockRenderer"
import { BlockModelData } from "./types"

/**
 * Defines the operations we use to format the raw data into
 * parsed page content
 *
 * This class contains the methods that were formerly in the contentGenerator
 * and readBlockData files.
 */
export class MinecraftAssetReader {
  blockRenderer: MinecraftBlockRenderer

  constructor() {
    this.blockRenderer = new MinecraftBlockRenderer()
  }

  /**
   * Controlling method to handle the entire "parse data" operation
   */
  async parseRawData() {
    await this.parseModelData()
  }

  /**
   * Helper method to load texture names for the given block model.
   *
   * @param args
   * @returns
   */
  private getTextureNamesFromRawBlockData(args: { blockData: BlockModelData }) {
    const { blockData } = args
    const textureNameArray = [] as string[]

    if (blockData.textures) {
      Object.keys(blockData.textures).forEach((key) => {
        const textureName = blockData.textures![key]!
        if (!textureNameArray.includes(textureName)) {
          textureNameArray.push(textureName)
        }
      })
    }

    if (blockData.elements) {
      blockData.elements.forEach((element) => {
        Object.keys(element.faces).forEach((key) => {
          const textureName = element.faces[key].texture
          if (!textureNameArray.includes(textureName)) {
            textureNameArray.push(textureName)
          }
        })
      })
    }

    return textureNameArray
  }

  private async parseModelData() {
    const newParsedData = {} as ParsedData
    const rawData = await CACHE.getRawDataFromCache()
    const mappedNamespaces = Object.keys(rawData)
    mappedNamespaces.forEach((namespace) => {
      // Init the namespace fields
      if (!newParsedData[namespace]) {
        newParsedData[namespace] = {
          blockPages: [],
          itemPages: [],
        }
      }

      // TODO: Revise this and reuse this logic; don't just arbitrarily-load 
      // const blockModelNames = Object.keys(this.contentMap[namespace].blocks)
      // blockModelNames.forEach((name) => {
      //   this.blockRenderer
      //     .drawBlockPageIcon({
      //       namespace,
      //       blockKey: name,
      //       blockIconData: this.contentMap[namespace].blocks[name].iconData,
      //       lightDirection: LIGHT_DIRECTION.LEFT, // Unused right now
      //     })
      //     .then((iconBase64) => {
      //       newParsedData[namespace].blockPages?.push({
      //         title: name,
      //         description: ``,
      //         icon: iconBase64,
      //       })
      //       return CACHE.setCachedParsedData(newParsedData)
      //     })
      // })
    })
    await CACHE.setCachedParsedData(newParsedData)
  }

  /**
   * Helper method to load the texture base64 data for all of the imported pages
   */
  private async parseTextures() {
    const parsedData = await CACHE.getParsedDataFromCache()
    const assetsPath = await CACHE.getRootAssetsPath()
    const namespaces = Object.keys(parsedData)
    namespaces.forEach((namespace) => {
      // Load block page textures
      parsedData[namespace].blockPages?.forEach((blockPage) => {
        // blockPage.textureNames.forEach((textureName) => {
        //   if (!textureName.includes(`#`)) {
        //     const path = `${assetsPath}/${namespace}/textures/${textureName}.png`
        //     const buffer = readFileSync(path)
        //     blockPage.textures[textureName] = buffer.toString(`base64`)
        //   }
        // })
      })
    })
    await CACHE.setCachedParsedData(parsedData)
  }
}
