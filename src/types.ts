// This file only contains types that are used when uploading data to a CMS

import {
  BlockBlockstateData,
  BlockModelData,
  ItemModelData,
} from "./minecraft/types"

// Defines the Int type
export type Int = number & { __int__: void }

export const roundToInt = (num: number): Int => Math.round(num) as Int

export const BLOCK_PAGES = [] as BlockPage[]
export const ITEM_PAGES = [] as ItemPage[]

export type RawAssetData = {
  /**
   * The namespace to which the contained assets belong (e.g., "minecraft")
   */
  [namespace: string]: {
    /**
     * Object containing all blockstate data within the given namespace
     */
    blockstates: {
      /**
       * Key-value pair; file name of the blockstate as the key and BlockBlockstateData
       * as the value
       */
      [blockstateFileName: string]: BlockBlockstateData
    }
    /**
     * Object containing all block and item model data within the given namespace
     */
    model: {
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
    /**
     * Object containing all block and item texture data within the given namespace
     */
    texture: {
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
  }
}

/**
 * Represents the fields expected on an arbitrary Block model when
 * added to a CMS
 */
export type BlockPage = {
  /**
   * The title of the page, which is also the name of the block
   */
  title: string
  /**
   * Description of this block (set by the user in a CMS, ideally)
   */
  description?: string
  /**
   * The image to upload as the block pages main image
   */
  icon?: Buffer
  /**
   * A list of the texture names associated with this Block.
   *
   * If this array is empty, then we know that this Block doesn't have textures made specifically for it,
   * but rather reuses textures made for other models.
   */
  textureNames: string[]
  /**
   * An object containing texture files that this block uses
   */
  textures: {
    [fileName: string]: string
  }
}

/**
 * Represents the fields expected on an arbitrary Item model when
 * added to a CMS
 */
export type ItemPage = {
  /**
   * The title of the page, which is also the name of the item
   */
  title: string
  /**
   * The image to upload as the item pages main image
   */
  icon?: Buffer
  /**
   * A list of model file names that this item uses
   */
  models: string[]
  /**
   * Description of this item (set by the user in a CMS, ideally)
   */
  description?: string
  /**
   * A list of texture files that this item uses
   */
  textures: Buffer[]
}

export type ParsedNamespaceData = {
  blockPages?: BlockPage[]
  itemPages?: ItemPage[]
}

export type ParsedData = {
  [namespace: string]: ParsedNamespaceData
}
