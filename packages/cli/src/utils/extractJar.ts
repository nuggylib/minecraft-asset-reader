import unzipper from "unzipper"
import { createReadStream } from "fs"

// extractJar accepts a file path to a .jar file and a path to extract
// the .jar into.
export async function extractJar(path: any, exportPath: any) {
  // createReadStream(path)
  //   .pipe(unzipper.Extract({ path: exportPath}))

  return unzipper.Open.file(path).then((d) => d.extract({ path: exportPath }))
}
