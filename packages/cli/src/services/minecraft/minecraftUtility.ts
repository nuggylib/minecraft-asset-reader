import fs from "fs"
import { lstatSync } from "fs"
import { join } from "path"
import { CACHE } from "../../main"
import { RawAssetData } from "../../types/cache"
import { BlockModelData, ItemModelData } from "../../types/minecraft"

/**
 * Helper to determine if the source is a directory or not
 *
 * @param source
 */
const isDirectory = (source: string) => lstatSync(source).isDirectory()

const EXPECTED_RESOURCE_DIRECTORIES = [`blockstates`, `models`, `textures`]

export class MinecraftUtility {
  /**
   * Reads in raw data using the cached base assets path.
   *
   * @param path  The path to attempt to read in as an assets directory
   * @returns     `true` if the data was read in successfully, otherwise `false`
   */
  readInRawData(args: { path: string }) {
    console.log(`path to readInRawData: `, args.path)
    const assetsDir = fs.readdirSync(args.path)
    const namespaces = [] as string[]
    assetsDir.forEach((name) => {
      const namespacePath = join(args.path, name)
      if (isDirectory(namespacePath)) {
        namespaces.push(name)
      }
    })
    let rawData = {} as RawAssetData
    /**
     * TODO: Only add namespace to rawData if it has the expected data
     * For example, the `realms` namespace in version 1.16.5 doesn't have the
     * expected file structure: `textures`, `models`, and `blockstates`.
     * We'll eventually deprecate the need for the `blockstates directorty.
     */

    namespaces.forEach((namespace) => {
      console.log(`NAMESPACE:   `, namespace)
      try {
        if (
          fs.existsSync(args.path + `/` + namespace + `/models`) &&
          fs.existsSync(args.path + `/` + namespace + `/textures`)
        ) {
          const rawNamespaceData = {
            [namespace]: {
              model: this.readModels({
                namespace: namespace,
                path: args.path,
              }),
            },
          }
          rawData = {
            ...rawData,
            ...rawNamespaceData,
          }
        } else {
          console.log(
            `Skipping namespace ${namespace} because it does not have the expected file structure.`
          )
        }
      } catch (e) {
        console.log(`Error with ${namespace}`, e)
      }
    })
    const parts = args.path.split(`/`)
    // TODO: Find out how easy it is to break this and make it less breakable (this can certainly be cleaned up)
    // Assumes the parent directory name to the assets directory is the game version name (as is the case with base Minecraft game files)
    const gameVersion = parts[parts.length - 2]
    CACHE.setCachedGameVersion(gameVersion)
    CACHE.setCachedRawData(rawData)
    CACHE.setRootAssetsPath(args.path)
  }

  /**
   * Determine if the given path is a valid assets directory
   *
   * @param param0
   * @returns
   */
  validatePathAsAssetsDirectory({ path }: { path: string }): boolean {
    try {
      let isValid = true
      const assetsDir = fs.readdirSync(path)
      // Will be things like <mod_id>, minecraft, etc.
      const assetsNestedDirectories = assetsDir
        .map((name) => join(path, name))
        .filter(isDirectory)
      // Directory names within a the detected namespaces (e.g., blockstates, model, etc.)
      assetsNestedDirectories.forEach((dir) => {
        const directoryContents = fs.readdirSync(dir)
        if (
          !(
            directoryContents.length > 0 &&
            this.isValidTexturePackDirectory(directoryContents)
          )
        ) {
          isValid = false
        }
      })

      return isValid
    } catch (e) {
      return false
    }
  }

  private isValidTexturePackDirectory = (
    nestedDirectories: string[]
  ): boolean => {
    EXPECTED_RESOURCE_DIRECTORIES.forEach((dir) => {
      if (!nestedDirectories.includes(dir)) {
        // An expected directory was missing - return false
        return false
      }
    })
    return true
  }

  /**
   * Reads in the model data for the given namespace at the given path
   *
   * Note that this method is responsible for "replacing" the regular model
   * texture key with the value. We do this because the key normally used
   * for the textures is just an arbitrary internal string; it has no meaning
   * outside of the model definition file. The value for each texture key
   * is something like "/blocks/bedrock"; we use this path fragment to load in
   * the actual image as a buffer and convert it to base64. This ensures the
   * front end can still get the images, while also be able to provide a valid
   * resource path (using the regular keys as a resource path will fail).
   *
   * @param namespace     The namespace of the texture pack (e.g., "minecraft")
   * @param path          The path to the root assets directory
   */
  private readModels({ namespace, path }: { namespace: string; path: string }) {
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
      const rawBlock = JSON.parse(content) as BlockModelData

      let convertedBlock = {
        textures: {},
      } as BlockModelData
      if (!!rawBlock.textures) {
        Object.keys(rawBlock.textures).forEach((textureKey) => {
          if (!rawBlock.textures![textureKey]!.includes(`#`)) {
            let texturePathFragment:
              | string
              | string[]
              | undefined = rawBlock.textures![textureKey]
            if (texturePathFragment?.includes(`:`)) {
              let colonIndex = texturePathFragment.indexOf(`:`)
              console.log(`colonIndex --> `, colonIndex)
              let texturePathFragmentArray = Array.from(texturePathFragment)
              // console.log(
              //   `texturePathFragmentArray --> `,
              //   texturePathFragmentArray
              // )
              texturePathFragmentArray.splice(0, colonIndex + 1)

              texturePathFragment = texturePathFragmentArray.join(``)
              // console.log(`texturePathFragment --> `, texturePathFragment)
            }
            // console.log(
            //   `${texturesPathRoot}/${texturePathFragment}.png`
            // )
            const base64 = fs

              .readFileSync(`${texturesPathRoot}/${texturePathFragment}.png`)
              .toString(`base64`)
            // Here, we replace the "old" key (which is really generic)
            // with the texture name - the value is the base64 for the image
            convertedBlock.textures![
              texturePathFragment!
            ] = `data:image/png;base64,${base64}`
          }
        })
      }
      model.block[blockModelName] = convertedBlock
    })
    itemModelFiles.forEach((filename) => {
      const content = fs.readFileSync(itemModelsPath + filename, `utf-8`)
      const itemModelName = filename.split(`.`)[0]
      model.item[itemModelName] = JSON.parse(content)
    })
    return model
  }
}
