import { filter, matches } from "lodash"

export type RawAssetData = {
    [namespace: string]: {
        blockstates: any
        model: {
            block: any
            item: any
        }
        texture: {
            block: any
            item: any
        }
    }
}

/**
 * Holds a temporary reference to the data read-in from an assets directory
 * 
 * The data in this object is organized by the directory it's contained within (e.g.,
 * for item models, it will be stored in `resourceData.<NAMESPACE>.model.item.*`)
 */
export const resourceData = {} as RawAssetData

/**
 * Unifies the various data sub fields in resourceData used to define blocks
 * 
 * @returns     JSON object containing a fields for each block 
 * @see https://lodash.com/docs/4.17.15#filter
 * @see https://lodash.com/docs/4.17.15#matches
 */
export function unifyBlocks() {
    const namespaces = Object.keys(resourceData)
    const blocks = {} as any
    namespaces.forEach(namespace => {
        const blocksFromBlockstates = Object.keys(resourceData[namespace].blockstates)

        // 1 - Find out how many "actual" blocks there are (find a way to determine base model files from variants)

        // 2 - Consolidate block information so that blockstate, block model, and block texture info is all saved under the same key
        
    })
}

/**
 * Unifies the various data sub fields in resourceData used to define blocks
 * 
 * @returns     JSON object containing a fields for each block 
 */
export function unifyItems() {

}