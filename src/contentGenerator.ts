import { readFileSync } from "fs"
import { filter, findIndex, indexOf } from "lodash"
import { error, log, warn } from "./cli"
import { BlockBlockstateData, BlockModelData, BlockstateMultipartCase, ItemModelData } from "./minecraft/types"
import { BlockPage, BLOCK_PAGES, Int } from "./types"

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
 * Holds a temporary reference to the data read-in from an assets directory
 * 
 * The data in this object is organized by the directory it's contained within (e.g.,
 * for item models, it will be stored in `resourceData.<NAMESPACE>.model.item.*`)
 */
export const resourceData = {} as RawAssetData

function loadTexturesFromBlockstateVariants({ namespace, blockName, assetsPath }: { namespace: string, blockName: string, assetsPath: string }): string[] {
    let texturesForBlockModelFile = [] as string[]
    // The textures referenced in the model.json file - can be one or many
    const variants = resourceData[namespace].blockstates[blockName].variants
    // Sometimes, a single key can correspond to a value that is an array of models - this needs to be handled as well
    Object.keys(variants!).forEach(key => {
        const variantData = variants![key]!
        const modelName = variantData.model
        try {
            const modelData = readFileSync(`${assetsPath}/${namespace}/models/block/${modelName}.json`, 'utf8')
            const modelJson = JSON.parse(modelData)
            Object.keys(modelJson.textures!).forEach(textureKey => {
                const textureName = modelJson.textures![textureKey]!.replace("blocks/", "")
                if (!texturesForBlockModelFile.includes(textureName) && !textureName.includes("#")) {
                    texturesForBlockModelFile.push(textureName)
                }
            })
        } catch (e) {
            error(`Error evaluating key '${key}' for block '${blockName}': ` + e.message)
        }
        
    })
    return texturesForBlockModelFile
}

/**
 * Helper method to generate the base BlockPage data
 * 
 */
function generateBaseBlockPageData({ namespace, assetsPath }: { namespace: string, assetsPath: string }) {

        // Start with data in blockstates as the first set of "core" blocks
        const blockNames = Object.keys(resourceData[namespace].blockstates)

        // Iterate over the block names found using the blockstates data
        blockNames.forEach(blockName => {
            let variantModelNames = [] as string[]
            let multipartCases = [] as BlockstateMultipartCase[]
            const blockstateDataForBlock = resourceData[namespace].blockstates[blockName]
            if (blockstateDataForBlock.variants!) {
                // This blockstates file uses variants
                const variants = blockstateDataForBlock.variants
                Object.keys(variants).forEach(key => {
                    if (key && !variantModelNames.includes(variants[key].model)) {
                        variantModelNames.push(variants[key].model)
                    }
                })
            } else if (blockstateDataForBlock.multipart!) {
                // This blockstates file uses multipart
                multipartCases = blockstateDataForBlock.multipart
            }
            let textureNamesForBlockstate = [] as any[]
            try {
                textureNamesForBlockstate = loadTexturesFromBlockstateVariants({
                    namespace,
                    assetsPath,
                    blockName,
                })
            } catch (e) {
                // TODO: Make this log event a "warn" level
                /**
                 * N.B.
                 * 
                 * It is possible, and acceptable, for the variants field to be undefined. This happens when the blockstates
                 * file uses a multipart field, in which case, variants *can't* be defined (they are mutually-exclusive).
                 * 
                 * When variants is undefined, we simply log what likely happened, then move on.
                 */
                warn(`Encountered blockstate file with undefined variants - skipping texture loading for '${blockName}'`)
            }
            BLOCK_PAGES.push({
                title: blockName,
                textureNames: textureNamesForBlockstate,
                textures: {},
                variantModelNames,
                models: [blockName],
                multipartCases,
            })
            
            
        })
}

/**
 * Returns an array of texture file names from the texture field
 */
function loadTexturesFromTextureField({ namespace, blockModelFileName }: { namespace: string, blockModelFileName: string }): string[] {
    let texturesForBlockModelFile = [] as string[]
    // The textures referenced in the model.json file - can be one or many
    const blockTextures = resourceData[namespace].model.block[blockModelFileName].textures
    Object.keys(blockTextures!).forEach(texture => {
        const textureName = blockTextures![texture]!.replace("blocks/", "")
        if (!texturesForBlockModelFile.includes(textureName) && !textureName.includes("#")) {
            texturesForBlockModelFile.push(textureName)
        }
    })
    return texturesForBlockModelFile
}

/**
 * Returns an array of texture file names from the elements
 */
function loadTexturesFromElements({ namespace, blockModelFileName }: { namespace: string, blockModelFileName: string }): string[] {
    let texturesForBlockModelFile = [] as string[]
    const elements = resourceData[namespace].model.block[blockModelFileName].elements
    elements?.forEach(element => {
        if (element.faces) {
            const faces = element.faces
            Object.keys(faces).forEach(faceDirection => {
                const textureName = faces[faceDirection].texture
                if (!texturesForBlockModelFile.includes(textureName) && !textureName.includes("#")) {
                    // log(`ADDING ELEMENT TEXTURE: `, textureName)
                    texturesForBlockModelFile.push(textureName)
                }
            })
        }
        
    })
    return texturesForBlockModelFile
}

/**
 * Helper method to add an array of texture names to an existing block page
 */
function addTextureNamesToExistingEntry({ blockName, texturesForBlockModel }: { blockName: string, texturesForBlockModel: string[] }) {
    const index = findIndex(BLOCK_PAGES, page => page.title === blockName)
    texturesForBlockModel.forEach(textureName => {
        if (!BLOCK_PAGES[index].textureNames.includes(textureName)) {
            BLOCK_PAGES[index].textureNames.push(textureName)
        }
    })
}

/**
 * Helper method to add model data to the base block page data that should have already been
 * generated.
 * 
 * This also loads in the texture file names for the blocks, making it easier to link the
 * image files later.
 */
function populateBaseBlockPageModelData({ namespace }:  { namespace: string }) {

    const blockModelFileNames = Object.keys(resourceData[namespace].model.block)
    // TODO: Clean this nasty ass nested mess of a block of doodoo
    blockModelFileNames.forEach(blockModelFileName => {

        let texturesForBlockModel = [] as any[]
        try {
            if (resourceData[namespace].model.block[blockModelFileName].textures!) {
                texturesForBlockModel = loadTexturesFromTextureField({ namespace, blockModelFileName })
            } else if (resourceData[namespace].model.block[blockModelFileName].elements!) {
                // This block model file doesn't have a textures field, but uses the "elements" field instead (which has nested textures)
                texturesForBlockModel = loadTexturesFromElements({ namespace, blockModelFileName })
            }
        } catch (e) {
            error(`Encountered error loading texture names for '${blockModelFileName}': ` + e.message)
        }
        const matches = filter(BLOCK_PAGES , page => {
            if (blockModelFileName.includes("wheat")) {
                return blockModelFileName.includes(page.title)
            } else {
                return blockModelFileName === page.title
            }
        })
        let match = {} as BlockPage
        if (matches.length === 0) {
            // Encountered a new block type that wasn't defined in blockstates
            match = {
                title: blockModelFileName,
                textures: {},
                textureNames: texturesForBlockModel,
                multipartCases: [],
                models: [],
            }
            // Add the new block to the global list of block pages
            BLOCK_PAGES.push(match)
        }
        if (matches.length === 1) {
            addTextureNamesToExistingEntry({
                blockName: matches[0].title,
                texturesForBlockModel
            })
        } else {
            let found = false;
            // TODO: Find a way to mutate the actual data - matches is just a copy
            matches.forEach((matchingPage, index) => {
                // IDEA: since we can't assume modders will use underscores, we may want to consider using string length later
                const titleArray = matchingPage.title.split("_")
                const fileNameArray = blockModelFileName.split("_")
                const blockName = matches[index].title
                // Exact match
                if (matchingPage.title === blockModelFileName) {
                    found = true
                    addTextureNamesToExistingEntry({
                        blockName,
                        texturesForBlockModel
                    })
                }

                if (!found && (titleArray.length === (fileNameArray.length - 1))) {
                    found = true
                    addTextureNamesToExistingEntry({
                        blockName,
                        texturesForBlockModel
                    })
                }

                if (!found && (titleArray.length === (fileNameArray.length - 2))) {
                    found = true
                    addTextureNamesToExistingEntry({
                        blockName,
                        texturesForBlockModel
                    })
                }

                if (!found && (titleArray.length === (fileNameArray.length - 3))) {
                    found = true
                    addTextureNamesToExistingEntry({
                        blockName,
                        texturesForBlockModel
                    })
                }

                const targetIndex = indexOf(BLOCK_PAGES, matchingPage)
                BLOCK_PAGES[targetIndex].models.push(blockModelFileName)
            })
        }
    })
}

function addTextureFilesAsImageDataToBlockPages({ assetsPath, namespace } : { assetsPath: string, namespace: string }) {
    BLOCK_PAGES.forEach((blockPage, index) => {
        let message = (`BLOCK: ` + blockPage.title)
        blockPage.textureNames!.forEach(textureName => {
            message += `\n     - TEXTURE: ` + textureName
            const imageBuffer = readFileSync(`${assetsPath}/${namespace}/textures/blocks/${textureName}.png`)
            BLOCK_PAGES[index].textures[textureName] = imageBuffer.toString("base64")
        })
        log(message)
    })
}

/**
 * Unifies the various data sub fields in resourceData used to define blocks
 * 
 * @returns     JSON object containing a fields for each block 
 * @see https://lodash.com/docs/4.17.15#filter
 * @see https://lodash.com/docs/4.17.15#matches
 */
export function generateBlockPageData({ assetsPath } : { assetsPath: string }) {
    const namespaces = Object.keys(resourceData)
    namespaces.forEach(namespace => {
        
        
        try {
            generateBaseBlockPageData({ namespace, assetsPath })
        } catch (e) {
            error(`Error during generateBaseBlockPageData: ` + e.message)
        }

        try {
            populateBaseBlockPageModelData({ namespace })
        } catch (e) {
            error(`Error during populateBaseBlockPageModelData: ` + e.message)
        }

        try {
            addTextureFilesAsImageDataToBlockPages({ assetsPath, namespace })
        } catch (e) {
            error(`Error during addTextureFilesAsImageDataToBlockPages: ` + e.message)
        }
        
        
        
    })
}

/**
 * Unifies the various data sub fields in resourceData used to define blocks
 * 
 * @returns     JSON object containing a fields for each block 
 */
export function unifyItems() {

}