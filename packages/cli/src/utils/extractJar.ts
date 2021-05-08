import unzipper from "unzipper"
import { createReadStream, existsSync } from "fs"

// extractJar accepts a file path to a .jar file and a path to extract
// the .jar into.
export async function extractJar(path: any, exportPath: any) {
  // createReadStream(path)
  //   .pipe(unzipper.Extract({ path: exportPath}))

  try {
    if (existsSync(path)) {
      return unzipper.Open.file(path).then((d) =>
        d.extract({ path: exportPath })
      )
    } else {
      console.log(`The Jar file doesn't exist.`)
    }
  } catch (e) {
    console.log(`An error occurred while checking for the Jar file.`)
  }
}
