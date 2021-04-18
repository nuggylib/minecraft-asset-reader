import fs from "fs"
import { isArray } from "lodash"
import { RAW_DATA } from "../contentGenerator"
import { BlockBlockstateData, BlockModelData, ItemModelData } from "./types"

/**
 * Reads in all blockstates files for the given namespace
 *
 * This method gets called once for each directory found in the assets directory
 *
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readBlockstates({
  namespace,
  path,
}: {
  namespace: string
  path: string
}) {
  const blockstatesPath = path + `/` + namespace + `/blockstates/`
  const files = fs.readdirSync(blockstatesPath)
  const blockstates = {} as {
    [blockstateFileName: string]: BlockBlockstateData
  }
  files.forEach((filename) => {
    // console.log(`Setting blockstate data for file '${filename}'`)
    const content = fs.readFileSync(blockstatesPath + filename, `utf-8`)
    const fileNameCleaned = filename.split(`.`)[0]
    const contentJson = JSON.parse(content)
    if (contentJson.variants) {
      Object.keys(contentJson.variants!).forEach((variantKey) => {
        if (isArray(contentJson.variants[variantKey])) {
          const nestedVariantsArray = contentJson.variants[variantKey] as any[]
          nestedVariantsArray.forEach((variantObj) => {
            contentJson.variants[
              `${variantKey}.${variantObj.model}`
            ] = variantObj
          })
          // Remove the array from the object after we mapped the textures from it
          delete contentJson.variants[variantKey]
        }
      })
    }
    blockstates[fileNameCleaned] = contentJson
  })
  return blockstates
}

/**
 *
 *
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readModels({
  namespace,
  path,
}: {
  namespace: string
  path: string
}) {
  const blockModelsPath = path + `/` + namespace + `/models/block/`
  const itemModelsPath = path + `/` + namespace + `/models/item/`
  const texturesPathRoot = path + `/` + namespace + `/textures`
  const blockModelFiles = fs.readdirSync(blockModelsPath)
  const itemModelFiles = fs.readdirSync(itemModelsPath)
  const model = {} as {
    block: {
      /**
       * Key-value pair; file name of texture as the key with the an BlockModelData
       * object as the value
       */
      [blockModelFileName: string]: BlockModelData
    }
    item: {
      /**
       * Key-value pair; file name of texture as the key with the an ItemModelData
       * object as the value
       */
      [itemModelFileName: string]: ItemModelData
    }
  }

  model.block = {}
  model.item = {}

  blockModelFiles.forEach((filename) => {
    const content = fs.readFileSync(blockModelsPath + filename, `utf-8`)
    const blockModelName = filename.split(`.`)[0]
    let block = JSON.parse(content) as BlockModelData
    if (!!block.textures) {
      Object.keys(block.textures).forEach((textureKey) => {
        if (!block.textures![textureKey]!.includes(`#`)) {
          const base64 = fs
            .readFileSync(
              `${texturesPathRoot}/${block.textures![textureKey]}.png`
            )
            .toString(`base64`)
          block.textures![textureKey] = `data:image/png;base64,${base64}`
        }
      })
    }
    model.block[blockModelName] = block
  })
  itemModelFiles.forEach((filename) => {
    const content = fs.readFileSync(itemModelsPath + filename, `utf-8`)
    const itemModelName = filename.split(`.`)[0]
    model.item[itemModelName] = JSON.parse(content)
  })

  return model
}

/**
 *
 *
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readTextures({
  namespace,
  path,
}: {
  namespace: string
  path: string
}) {
  const blockTexturesPath = path + `/` + namespace + `/textures/blocks/`
  const itemTexturesPath = path + `/` + namespace + `/textures/items/`
  const blockTextureFiles = fs.readdirSync(blockTexturesPath)
  const itemTextureFiles = fs.readdirSync(itemTexturesPath)
  const texture = {} as {
    /**
     * Object containing all block model file buffers
     */
    blocks: {
      /**
       * Key-value pair; file name of texture as the key with the file buffer as
       * the value
       */
      [blockTextureFileName: string]: Buffer
    }
    /**
     * Object containing all item model file buffers
     */
    items: {
      /**
       * Key-value pair; file name of texture as the key with the file buffer as
       * the value
       */
      [itemTextureFileName: string]: Buffer
    }
  }

  texture.blocks = {}
  texture.items = {}

  blockTextureFiles.forEach((filename) => {
    const content = fs.readFileSync(blockTexturesPath + filename)
    const fileNameCleaned = filename.split(`.`)[0]
    texture.blocks[fileNameCleaned] = content
  })
  itemTextureFiles.forEach((filename) => {
    const content = fs.readFileSync(itemTexturesPath + filename)
    const fileNameCleaned = filename.split(`.`)[0]
    texture.items[fileNameCleaned] = content
  })
  return texture
}
