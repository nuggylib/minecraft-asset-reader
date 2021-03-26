import { CACHE } from "../cache/cacheClient";
import mkdirp from "mkdirp"
import { ParsedData } from "../types";
import { writeFileSync } from "fs";

const DEFAULT_WRITE_PATH = `./generated/`

export class Exporter {

    /**
     * Write the cached parsed data to the local file system
     * 
     * @param args 
     */
    async exportParsedDataToLocalFilesystem(args: {
        path?: string,
        createSeparatePageFiles?: boolean
    }) {
        const parsedData = await CACHE.getParsedDataFromCache()
        let baseWritePath = `${DEFAULT_WRITE_PATH}/${new Date().toISOString()}`
        // If the user provided a write path, use that instead of the default write path
        if (args.path) {
            baseWritePath = args.path!
        }
        // Create the data export directory
        await mkdirp(baseWritePath)

        if (!!args.createSeparatePageFiles) {
            this.writePageContentAsSeparateJSONFiles({
                parsedData,
                baseWritePath,
            })
        } else {
            this.writePageContentAsJSONArrayFiles({
                parsedData,
                baseWritePath,
            })
        }
        return true
    }

    private writePageContentAsJSONArrayFiles(args: {
        parsedData: ParsedData
        baseWritePath: string,
    }) {
        const namespaces = Object.keys(args.parsedData)
        namespaces.forEach(namespace => {
            const {
                blockPages,
                itemPages
            } = args.parsedData[namespace]

            writeFileSync(`${args.baseWritePath}/block-pages.json`, JSON.stringify(blockPages))
            writeFileSync(`${args.baseWritePath}/item-pages.json`, JSON.stringify(itemPages))
        })
    }

    private writePageContentAsSeparateJSONFiles(args: {
        parsedData: ParsedData
        baseWritePath: string,
    }) {
        // TODO: Larah - complete this method :)
    }

}