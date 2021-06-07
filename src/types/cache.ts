import { BlockModelData, ItemModelData } from "./minecraft"

export type RawNamespaceData = {
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
}

export type RawAssetData = {
  /**
   * The namespace to which the contained assets belong (e.g., "minecraft")
   */
  [namespace: string]: RawNamespaceData
}

export type BlockIconData = {
  top: string
  sideL: string
  sideR: string
}
