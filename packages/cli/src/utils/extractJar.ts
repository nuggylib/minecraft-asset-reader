import unzipper from "unzipper"
import { createReadStream } from "fs"

// extractJar accepts a file path to a .jar file and a path to extract
// the .jar into.
export function extractJar(path: any, exportPath: any) {
  // createReadStream(path)
  //   .pipe(unzipper.Extract({ path: exportPath}))

  unzipper.Open.file(path).then((d) => d.extract({ path: exportPath }))
}
