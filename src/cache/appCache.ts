import { readBlockstates } from "../minecraft/readBlockData";
import { ParsedData, RawAssetData } from "../types";
import { CacheClient } from "./redisClient";

const enum KEYS {
    RAW_DATA = `raw_data`,
    PARSED_DATA = `parsed_data`,
    ASSETS_PATH = `assets_path`
}

export class AppCache {
    // The client to facilitate interactions with the underlying redis store
    redisClient = new CacheClient()

    constructor() {
        this.redisClient = new CacheClient()

        let parsedData: ParsedData
        let rawData: RawAssetData

        parsedData = {}
        rawData = {}
    }

    // TODO: Test this later to see if we can remove this - Redis may be more flexible than the react state
    /**
     * Initilizes the base object in the cache for the given namespace.
     */
    async initNamespaceParsedDataObject(args: { namespace: string }) {

        console.log(`Initializing namespace data structure for namespace: '${args.namespace}'`)

        let parsedData = await this.getParsedDataFromCache()

        parsedData = {
            [args.namespace]: {}
        }
        parsedData = {
            [args.namespace]: {
                blockPages: [],
                itemPages: []
            }
        }

        // Add the base-64 strings for the JSON objects
        const setBaseParsedDataForNamespaceResponse = await this.redisClient.setAsync(KEYS.PARSED_DATA, this.convertJsonToBase64({ json: parsedData }))

        // console.log(`SET PARSED DATA RESPOSE: `, setBaseParsedDataForNamespaceResponse)

        const rawDataAfterModification = await this.getRawDataFromCache()
        // console.log(`UPDATED RAW DATA: `, rawDataAfterModification)

        return setBaseParsedDataForNamespaceResponse
    }

    

    /**
     * Converts a Base64 string to a JSON object
     * 
     * @param args 
     */
    convertBase64StringToJson(args: {
        jsonBase64: string
    }) {
        const buffer = Buffer.from(args.jsonBase64, `base64`)
        const jsonString = buffer.toString(`utf-8`)
        return JSON.parse(jsonString)
    }

    /**
     * Converts a JSON object to a Base64 string
     * 
     * @param args 
     */
    convertJsonToBase64(args: {
        json: RawAssetData | ParsedData
    }) {
        return Buffer.from(JSON.stringify(args.json)).toString(`base64`)
    }

    async getRawDataFromCache(): Promise<RawAssetData> {
        const rawDataBase64 = await this.redisClient.getAsync(KEYS.RAW_DATA)
        // console.log(`GET RAW DATA BASE 64 RESULT: ${rawDataBase64?.substring(0, 11)}...`)
        if (rawDataBase64) {
            return this.convertBase64StringToJson({
                jsonBase64: rawDataBase64
            })
        }
        return {}
    }

    async getParsedDataFromCache(): Promise<ParsedData> {
        const parsedDataBase64 = await this.redisClient.getAsync(KEYS.PARSED_DATA)
        if (parsedDataBase64) {
            return this.convertBase64StringToJson({
                jsonBase64: parsedDataBase64
            })
        }
        return {}
    }

    async setCachedRawData(updatedRawDataObject: RawAssetData) {
        const cachedRawData = await this.getRawDataFromCache()
        const updatedRawData = {
            ...cachedRawData,
            ...updatedRawDataObject
        } as RawAssetData
        const updatedRawDataBase64 = this.convertJsonToBase64({ json: updatedRawData })
        // console.log(`SETTING BASE 64 FOR JSON: ${updatedRawDataBase64.substring(0, 11)}...`)

        const response = await this.redisClient.setAsync(
            KEYS.RAW_DATA,
            updatedRawDataBase64
        )
        // console.log(`SET CACHED RAW DATA RESPONSE: `, response)
    }

    // TODO: Figure out why the logging here only displays on the second run (something with the async stuff, I'm sure)
    async setCachedParsedData(updatedParsedDataObject: ParsedData) {
        const cachedParsedData = await this.getParsedDataFromCache()

        Object.keys(cachedParsedData).forEach(namespace => {
            const blockPageCount = cachedParsedData[namespace].blockPages!.length
            const itemPageCount = cachedParsedData[namespace].itemPages!.length

            console.log(`BLOCK PAGE COUNT: `, blockPageCount)
            console.log(`ITEM PAGE COUNT: `, itemPageCount)
        })

        const updatedParsedData = {
            ...cachedParsedData,
            ...updatedParsedDataObject
        } as ParsedData
        const updatedParsedDataBase64 = this.convertJsonToBase64({ json: updatedParsedData })
        const response = await this.redisClient.setAsync(
            KEYS.PARSED_DATA,
            updatedParsedDataBase64
        )
        // console.log(`SET CACHED PARSED DATA RESPONSE: `, response)
        return response
    }

    async setRootAssetsPath(rootAssetsPath: string) {
        return await this.redisClient.setAsync(KEYS.ASSETS_PATH, rootAssetsPath)
    }

    async getRootAssetsPath() {
        return await this.redisClient.getAsync(KEYS.ASSETS_PATH)
    }

    async deleteStaleRawData() {
        return await this.redisClient.delAsync([KEYS.RAW_DATA])
    }

    async deleteStaleParsedData() {
        return await this.redisClient.delAsync([KEYS.RAW_DATA])
    }
}