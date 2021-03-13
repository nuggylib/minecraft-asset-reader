import fs, { lstatSync } from "fs"
import { join } from "path"
import { resourceData } from "../contentGenerator"

/**
 * The bare minimum directories expected in order to generate the starter's
 * content.
 */
export const EXPECTED_RESOURCE_DIRECTORIES = [
    'blockstates',
    'models',
    'textures'
]

/**
 * Helper to determine if the source is a directory or not
 * 
 * @param source 
 */
const isDirectory = (source: string) => lstatSync(source).isDirectory()

const isValidTexturePackDirectory = (nestedDirectories: string[]): boolean => {
    EXPECTED_RESOURCE_DIRECTORIES.forEach(dir => {
        if (!nestedDirectories.includes(dir)) {
            // An expected directory was missing - return false
            return false
        }
    })
    return true
}

// TODO: Determine when the texturepack format was standardized for minecraft
/**
 * Determine if the given path is pointing to a valid assets directory (e.g., a directory containing one or more
 * valid texture packs)
 * 
 * @param path 
 */
export function validateAssetsDirAndGenerateData({ path }: { path: string }): boolean {
    
    try {
        const assetsDir = fs.readdirSync(path)
        // Will be things like <mod_id>, minecraft, etc.
        const assetsNestedDirectories = assetsDir.map(name => join(path, name)).filter(isDirectory)
        // Directory names within a the detected namespaces (e.g., blockstates, model, etc.)
        assetsNestedDirectories.forEach(dir => {
            const directoryContents = fs.readdirSync(dir)
            if (directoryContents.length > 0 && isValidTexturePackDirectory(directoryContents)) {
                var dirName = dir.split("/").pop() || ""
                resourceData[dirName] = {
                    blockstates: {},
                    model: {
                        block: {},
                        item: {},
                    },
                    texture: {
                        blocks: {},
                        items: {},
                    }
                }
            }
        })
        
        return true

    } catch (e) {
        return false
    }
    
}