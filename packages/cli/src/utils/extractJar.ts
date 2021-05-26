import unzipper from "unzipper"
import { existsSync } from "fs"

/**
 * extractJar(path, exportPath) accepts a file path to a .jar file
 * and a path to extract the .jar into. It extracts the .jar, then returns a promise.
 *
 * @param path
 * @param exportPath
 * @returns
 */
export async function extractJar(path: any, exportPath: any) {
  /**
   * An alternative way to extract a .jar file is to use:
   * `createReadStream(path).pipe(unzipper.Extract({ path: exportPath}))`
   */

  try {
    if (existsSync(path)) {
      return unzipper.Open.file(path).then((d) =>
        d.extract({ path: exportPath })
      )
    }
  } catch (e) {
    console.log(`An error occurred while checking for the Jar file.`)
  }
}
