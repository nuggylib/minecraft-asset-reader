import fs from "fs"
import { resourceData } from "./validateAssetsDirAndGenerateData";

export function readBlockstates({ key, path }: { key: string, path: string }) {
    const blockstatesPath = path  + "/" + key + "/blockstates/"
    const files = fs.readdirSync(blockstatesPath) 
    files.forEach( (filename) => {
      const content = fs.readFileSync(blockstatesPath + filename, 'utf-8') 
      const fileNameCleaned = filename.split(".")[0]
      resourceData[key][fileNameCleaned] = JSON.parse(content);
    });
}