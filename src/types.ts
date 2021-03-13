// This file only contains types that are used when uploading data to a CMS

import { BlockstateMultipartCase } from "./minecraft/types"

// Defines the Int type
export type Int = number & { __int__: void };

export const roundToInt = (num: number): Int => Math.round(num) as Int;

export const BLOCK_PAGES = [] as BlockPage[]
export const ITEM_PAGES = [] as ItemPage[]

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
     * The image to upload as the block pages main image
     */
    icon?: Buffer
    /**
     * A list of model file names that this block uses
     */
    models: string[]
    /**
     * Description of this block (set by the user in a CMS, ideally)
     */
    description?: string
    /**
     * The list of texture names referenced in the blockstates file.
     * 
     * Will be empty when:
     * 1. This block doesn't use a blockstates file (the only place 'varaints' is defined)
     * 2. This block's blockstate file uses 'multipart'
     */
    variantModelNames?: string[]
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
    /**
     * A list of multipart JSON objects that this block uses
     * 
     * Will be empty when:
     * 1. This block doesn't use a blockstates file (the only place 'multipart' is defined)
     * 2. This block's blockstate file uses 'variants'
     */
    multipartCases: BlockstateMultipartCase[]
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