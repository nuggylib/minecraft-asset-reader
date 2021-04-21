import { readFileSync } from "fs"
import { RawAssetData } from "./types"

/**
 * Holds a temporary reference to the data read-in from an assets directory
 *
 * The data in this object is organized by the directory it's contained within (e.g.,
 * for item models, it will be stored in `resourceData.<NAMESPACE>.model.item.*`)
 */
export const RAW_DATA = {} as RawAssetData

export function loadTexturesFromBlockstateVariants(args: {
  namespace: string
  blockName: string
  assetsPath: string
  rawData: RawAssetData
}): string[] {
  let texturesForBlockModelFile = [] as string[]
  // The textures referenced in the model.json file - can be one or many
  const variants =
    args.rawData[args.namespace].blockstates[args.blockName].variants
  // Sometimes, a single key can correspond to a value that is an array of models - this needs to be handled as well
  Object.keys(variants!).forEach((key) => {
    const variantData = variants![key]!
    const modelName = variantData.model
    try {
      const modelData = readFileSync(
        `${args.assetsPath}/${args.namespace}/models/block/${modelName}.json`,
        `utf8`
      )
      const modelJson = JSON.parse(modelData)
      Object.keys(modelJson.textures!).forEach((textureKey) => {
        const textureName = modelJson.textures![textureKey]!.replace(
          `blocks/`,
          ``
        )
        if (
          !texturesForBlockModelFile.includes(textureName) &&
          !textureName.includes(`#`)
        ) {
          texturesForBlockModelFile.push(textureName)
        }
      })
    } catch (e) {
      console.error(
        `Error evaluating key '${key}' for block '${args.blockName}': ` +
          e.message
      )
    }
  })
  return texturesForBlockModelFile
}

/**
 * Returns an array of texture file names from the texture field
 */
export function loadTexturesFromTextureField(args: {
  namespace: string
  blockModelFileName: string
  rawData: RawAssetData
}): string[] {
  let texturesForBlockModelFile = [] as string[]
  // The textures referenced in the model.json file - can be one or many
  const blockTextures =
    args.rawData[args.namespace].model.block[args.blockModelFileName].textures
  Object.keys(blockTextures!).forEach((texture) => {
    // console.log(`Loading texture '${texture}' for namespace '${args.namespace}'`)
    const textureName = blockTextures![texture]!.textureName.replace(
      `blocks/`,
      ``
    )
    if (
      !texturesForBlockModelFile.includes(textureName) &&
      !textureName.includes(`#`)
    ) {
      texturesForBlockModelFile.push(textureName)
    }
  })
  return texturesForBlockModelFile
}

/**
 * Returns an array of texture file names from the elements
 */
export function loadTexturesFromElements({
  namespace,
  blockModelFileName,
}: {
  namespace: string
  blockModelFileName: string
}): string[] {
  let texturesForBlockModelFile = [] as string[]
  const elements = RAW_DATA[namespace].model.block[blockModelFileName].elements
  elements?.forEach((element) => {
    if (element.faces) {
      const faces = element.faces
      Object.keys(faces).forEach((faceDirection) => {
        const textureName = faces[faceDirection].texture
        if (
          !texturesForBlockModelFile.includes(textureName) &&
          !textureName.includes(`#`)
        ) {
          // log(`ADDING ELEMENT TEXTURE: `, textureName)
          texturesForBlockModelFile.push(textureName)
        }
      })
    }
  })
  return texturesForBlockModelFile
}

/**
 * Unifies the various data sub fields in resourceData used to define blocks
 *
 * @returns     JSON object containing a fields for each block
 */
export function unifyItems() {}
