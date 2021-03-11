import fs from "fs"
import { resourceData } from "../contentGenerator";

/**
 * Reads in all blockstates files for the given namespace
 * 
 * This method gets called once for each directory found in the assets directory
 * 
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readBlockstates({ namespace, path }: { namespace: string, path: string }) {
    const blockstatesPath = path  + "/" + namespace + "/blockstates/"
    const files = fs.readdirSync(blockstatesPath) 
    files.forEach( (filename) => {
      const content = fs.readFileSync(blockstatesPath + filename, 'utf-8') 
      const fileNameCleaned = filename.split(".")[0]
      resourceData[namespace].blockstates[fileNameCleaned] = JSON.parse(content);
    });
}

/**
 * 
 * 
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readModels({ namespace, path }: { namespace: string, path: string }) {
  const blockModelsPath = path  + "/" + namespace + "/models/block/"
  const itemModelsPath = path  + "/" + namespace + "/models/item/"
  const blockModelFiles = fs.readdirSync(blockModelsPath) 
  const itemModelFiles = fs.readdirSync(itemModelsPath)
  blockModelFiles.forEach( (filename) => {
    const content = fs.readFileSync(blockModelsPath + filename, 'utf-8') 
    const fileNameCleaned = filename.split(".")[0]
    resourceData[namespace].model.block.fileNameCleaned = JSON.parse(content);
  });
  itemModelFiles.forEach( (filename) => {
    const content = fs.readFileSync(itemModelsPath + filename, 'utf-8') 
    const fileNameCleaned = filename.split(".")[0]
    resourceData[namespace].model.item[fileNameCleaned] = JSON.parse(content);
  });
}

/**
 * 
 * 
 * @param namespace     The namespace of the texture pack (e.g., "minecraft")
 * @param path          The path to the root assets directory
 */
export function readTextures({ namespace, path }: { namespace: string, path: string }) {
  const blockTexturesPath = path  + "/" + namespace + "/textures/blocks/"
  const itemTexturesPath = path  + "/" + namespace + "/textures/items/"
  const blockTextureFiles = fs.readdirSync(blockTexturesPath) 
  const itemTextureFiles = fs.readdirSync(itemTexturesPath)
  blockTextureFiles.forEach( (filename) => {
    const content = fs.readFileSync(blockTexturesPath + filename) 
    const fileNameCleaned = filename.split(".")[0]
    resourceData[namespace].texture.block[fileNameCleaned] = content;
  });
  itemTextureFiles.forEach( (filename) => {
    const content = fs.readFileSync(itemTexturesPath + filename) 
    const fileNameCleaned = filename.split(".")[0]
    resourceData[namespace].texture.item[fileNameCleaned] = content;
  });
}