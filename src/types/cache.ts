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

export type ConfiguredBlock = {
  /**
   * The "production-ready" name for the block, e.g., `Acacia Log`
   */
  title: string
  iconData: BlockIconData
  blockIconBase64?: string
}

/**
 * Controls what content actually gets parsed for your site (so you don't have to sift through tons of potential junk data -
 * e.g., blocks with complex shapes often have multiple "block" definitions that are actually just part of a larger model.
 * You most likely don't want these in your final site).
 */
export type ContentMap = {
  /**
   * You should have a namespace for each one you have in your assets directory
   */
  [namespace: string]: {
    blocks: {
      /**
       * Key-value pair; block name (e.g., `acacia_log`) as the key,
       * relevant block data as the value
       */
      [block: string]: ConfiguredBlock
    }
  }
}
