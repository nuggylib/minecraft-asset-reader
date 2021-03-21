import { readFileSync } from "fs"
import { filter, indexOf } from "lodash"
import { loadTexturesFromBlockstateVariants, loadTexturesFromElements, loadTexturesFromTextureField } from "../contentGenerator"
import { readBlockstates, readModels, readTextures } from "../minecraft/readBlockData"
import { BlockstateMultipartCase } from "../minecraft/types"
import { BlockPage, ItemPage, ParsedData, RawAssetData } from "../types"
import { AppCache } from "./appCache"

export const CACHE = new AppCache()

/**
 * Client class to help with more complicated cache operations
 */
class CacheClient {

    loadBlockTexturesForNamespace(args: { namespace: string, rawData: RawAssetData, parsedData: ParsedData, rootAssetsPath: string }) {

        const { 
            namespace,
            rawData,
            parsedData,
            rootAssetsPath
         } = args

         let localParsedData = {
             ...parsedData,
         } as ParsedData

        // console.log(`Pages to import textures for: `, parsedData![args.namespace].blockPages!.length)
        parsedData![args.namespace].blockPages!.forEach(blockPage => {
            // console.log(`Loading textures for '${blockPage.title}' in namespace '${args.namespace}'`)
            blockPage.textureNames.map(blockTextureName => {
                const indexOfBlockPage = indexOf(parsedData[args.namespace].blockPages, blockPage)
                // console.log(`INDEX OF TARGET BLOCK PAGE: `, indexOfBlockPage)
                const imageBuffer = readFileSync(`${rootAssetsPath}/${args.namespace}/textures/blocks/${blockTextureName}.png`)

                // Create a new BlockPage from the existing data and the new data
                let updatedBlock = parsedData![args.namespace].blockPages![indexOfBlockPage]
                updatedBlock.textures[blockTextureName] = imageBuffer.toString("base64")


                // Remove the stale entry
                localParsedData[namespace].blockPages!.splice(indexOfBlockPage, 1)
                // Add the updated entry
                localParsedData[namespace].blockPages!.push(updatedBlock)
            })
            // console.log(`Texture loaded for '${blockPage.title}'!`)
        })

        return localParsedData
    }

    async setRootAssetsPath(rootAssetsPath: string) {
        return await CACHE.setRootAssetsPath(rootAssetsPath)
    }

    /**
     * Add the raw data to the redis store
     * 
     * @param rawAssetsData 
     */
    async setRawData(rawAssetsData: RawAssetData){
        // The raw data in the cache
        let rawData = await CACHE.getRawDataFromCache()
        const rootAssetsPath = await CACHE.getRootAssetsPath()
        // The namespaces detected in the raw data passed-in to this method (NOT the data from the cache)
        const namespaces = Object.keys(rawAssetsData)
        namespaces.forEach(namespace => {
            rawData = {
                [namespace]: {
                    blockstates: readBlockstates({ 
                        namespace: namespace,
                        path: rootAssetsPath!
                    }),
                    model: readModels({ 
                        namespace: namespace,
                        path: rootAssetsPath!
                    }),
                    texture: readTextures({ 
                        namespace: namespace,
                        path: rootAssetsPath!
                    }),
                }

            }
        })
        await CACHE.setCachedRawData(rawData)
        const rawDataUpdated = await CACHE.getRawDataFromCache()
    }

    /**
     * Parses imported raw data into base site page content
     */
    async parseImportedData() {
        const rawData = await CACHE.getRawDataFromCache()
        const assetsPath = await CACHE.getRootAssetsPath()
        let localParsedData = {} as ParsedData
        Object.keys(rawData).forEach(namespace => {

            const blockPagesFromBlockstates = this.generatePageDataFromBlockstatesForNamespace({
                namespace,
                assetsPath: assetsPath!,
                rawData,
            })

            localParsedData = {
                ...localParsedData,
                [namespace]: {
                    blockPages: blockPagesFromBlockstates,
                    itemPages: []
                }
            }

            const parsedDataNoTextureBufferStrings = this.addTextureNamesToBlockPages({
                namespace,
                assetsPath: assetsPath!,
                rawData,
                parsedData: localParsedData
            })

            localParsedData = this.loadBlockTexturesForNamespace({
                namespace,
                rawData,
                parsedData: parsedDataNoTextureBufferStrings,
                rootAssetsPath: assetsPath!
            })
        })
        await CACHE.setCachedParsedData(localParsedData)
    }

    /**
     * Generate page data for Blocks from the blockstates in the given namespace's raw data
     * 
     * @param args 
     */
    generatePageDataFromBlockstatesForNamespace(args: { namespace: string, assetsPath: string, rawData: RawAssetData }) {
        const blockNamesInferredFromBlockstates = Object.keys(args.rawData[args.namespace].blockstates)
        const blockPages = [] as BlockPage[]
        blockNamesInferredFromBlockstates.forEach( blockName => {
            // console.log(`Generating page data for block '${blockName}' in namespace '${args.namespace}'`)
            let variantModelNames = [] as string[]
            let multipartCases = [] as BlockstateMultipartCase[]
            const blockstateDataForBlock = args.rawData[args.namespace].blockstates[blockName]
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
                    namespace: args.namespace,
                    assetsPath: args.assetsPath!,
                    blockName,
                    rawData: args.rawData
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
                console.warn(`Encountered blockstate file with undefined variants - skipping texture loading for '${blockName}'`)
            }
            blockPages.push({
                title: blockName,
                models: [blockName],
                textureNames: textureNamesForBlockstate,
                textures: {},
                multipartCases,
            })
        })
        return blockPages
    }

    /**
     * Adds texture names to block pages
     * 
     * If a model file name is encountered and it's not related to an existing Block page, then we know
     * the given model file is not one that was defined in blockstates. In this case, we need to create
     * a new block page _and_ add the texture names to it. This is the only exception. For all other blocks,
     * the texture name(s) is/are added to the corresponding block page
     * 
     * @param args 
     * @returns A modified copy of the parsedData object passed to this method; e.g., the "updated parsedData" object
     */
    addTextureNamesToBlockPages(args: 
        {
            namespace: string,
            assetsPath: string,
            rawData: RawAssetData,
            parsedData: ParsedData
        }) 
    {

        const { 
            namespace,
            assetsPath,
            rawData,
            parsedData
         } = args

         // Used to store modifications to parsed data object, returned to be used as the updated version
         let localParsedData = {
             ...parsedData
         } as ParsedData
    
        /**
         * The list of model file names stored in the raw data - each model file will contain one, or many
         * textures, depending on the file setup
         */
        const blockModelFileNames = Object.keys(rawData[namespace].model.block)
        blockModelFileNames.map(blockModelFileName => {
            /**
             * The complete list of textures for the current block
             * 
             * This contains a list of the texture names after they've been loaded from the model's textures
             * or elements field; if textures is defined, elements will be undefined, and vice versa.
             */
            let texturesForBlockModel = [] as any[]
            try {
                if (rawData[namespace].model.block[blockModelFileName].textures!) {
                    texturesForBlockModel = loadTexturesFromTextureField({ namespace: namespace, blockModelFileName, rawData: rawData })
                } else if (rawData[namespace].model.block[blockModelFileName].elements!) {
                    // This block model file doesn't have a textures field, but uses the "elements" field instead (which has nested textures)
                    texturesForBlockModel = loadTexturesFromElements({ namespace: namespace, blockModelFileName })
                }
            } catch (e) {
                console.warn(`Encountered model file with unddefined textures field - this is not necessarily a problem - skipping loading textures for model file '${blockModelFileName}'`)
            }
            /**
             * The list of maching blocks for the current blockModelName
             */
            const blockPageMatchesForTextureFileName = filter(parsedData[namespace].blockPages , page => {
                /**
                 *  Wheat model file names don't follow convention and have numbers appended to the end of the file name 
                 * (they will never match exactly with the base model and need to be handled specially)
                 */
                if (blockModelFileName.includes("wheat")) {
                    return blockModelFileName.includes(page.title)
                } else {
                    return blockModelFileName === page.title
                }
            })
            if (blockPageMatchesForTextureFileName.length === 0) {
                // A new block definition was encountered (e.g., no matches found)
                localParsedData[namespace].blockPages!.push({
                    title: blockModelFileName,
                    textures: {},
                    textureNames: texturesForBlockModel,
                    multipartCases: [],
                    models: [],
                })
            } else if (blockPageMatchesForTextureFileName.length === 1) {
                let indexOfBlockPage: number
                // Only one match was found for the current block model file name - index is 0
                indexOfBlockPage = indexOf(parsedData[namespace].blockPages, blockPageMatchesForTextureFileName[0])

                // Create a new BlockPage from the existing data and the new data
                let updatedBlock = parsedData[namespace].blockPages![indexOfBlockPage]
                // console.log(`UPDATED BLOCK: `, updatedBlock)
                updatedBlock.textureNames = [
                    ...updatedBlock.textureNames,
                    ...texturesForBlockModel,
                ]

                // Remove the stale entry
                localParsedData[namespace].blockPages!.splice(indexOfBlockPage, 1)
                // Add the updated entry
                localParsedData[namespace].blockPages!.push(updatedBlock)
            } else {
                // Multiple matching block pages were found, add the block model definition to each of them
                blockPageMatchesForTextureFileName.forEach((_, index) => {
                    let indexOfBlockPage: number
                    // Only one match was found for the current block model file name - index is 0
                    indexOfBlockPage = indexOf(parsedData[namespace].blockPages, blockPageMatchesForTextureFileName[index])

                    // Create a new BlockPage from the existing data and the new data
                    let updatedBlock = parsedData[namespace].blockPages![indexOfBlockPage]
                    // console.log(`UPDATED BLOCK: `, updatedBlock)
                    updatedBlock.textureNames = [
                        ...updatedBlock.textureNames,
                        ...texturesForBlockModel,
                    ]

                    // Remove the stale entry
                    localParsedData[namespace].blockPages!.splice(indexOfBlockPage, 1)
                    // Add the updated entry
                    localParsedData[namespace].blockPages!.push(updatedBlock)
                })
            }
        })
        return localParsedData
    }

}

export const CACHE_CLIENT = new CacheClient()