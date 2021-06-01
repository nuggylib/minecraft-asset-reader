import unzipper from "unzipper"
const os = require(`os`)
const systemUser = os.userInfo().username
const currentOs = os.type()

/**
 * extractJar(path, exportPath) accepts a file path to a .jar file
 * and a path to extract the .jar into. It extracts the .jar, then returns a promise.
 *
 * @param path
 * @param exportPath
 * @returns
 */
export async function extractJar(
  selectedVersion: string,
  exportPath?: string
): Promise<string> {
  const linuxJar = `/home/${systemUser}/.minecraft/versions/${selectedVersion}/${selectedVersion}.jar`
  const darwinJar = `~/Library/Application Support/minecraft/versions/${selectedVersion}/${selectedVersion}.jar`
  const winJar = `%appdata%\\.minecraft\\versions\\${selectedVersion}\\${selectedVersion}.jar`
  const linuxAssets = `/home/${systemUser}/.minecraft/versions/${selectedVersion}/assets`
  const darwinAssets = `~/Library/Application Support/minecraft/versions/${selectedVersion}/assets`
  const winAssets = `%appdata%\\.minecraft\\versions\\${selectedVersion}\\assets`

  let exportDirectory = ``

  // When this is unset, we simply export to the same location the JAR was located at
  if (!exportPath) {
    let jarPathParts = [] as string[]
    switch (currentOs) {
      case `Linux`:
        jarPathParts = linuxJar.split(`/`)
        jarPathParts.pop()
        exportDirectory = jarPathParts.join(`/`)
        break
      case `Darwin`:
        jarPathParts = darwinJar.split(`/`)
        jarPathParts.pop()
        exportDirectory = jarPathParts.join(`/`)
        break
      case `Windows_NT`:
        jarPathParts = winJar.split(`\\`)
        jarPathParts.pop()
        exportDirectory = jarPathParts.join(`\\`)
        break
      default: {
        break
      }
    }
  }

  let jarPath = ``
  let assetsPath = ``

  switch (currentOs) {
    case `Linux`:
      jarPath = linuxJar
      assetsPath = linuxAssets
      break
    case `Darwin`:
      jarPath = darwinJar
      assetsPath = darwinAssets
      break
    case `Windows_NT`:
      jarPath = winJar
      assetsPath = winAssets
      break
    default: {
      break
    }
  }
  /**
   * An alternative way to extract a .jar file is to use:
   * `createReadStream(path).pipe(unzipper.Extract({ path: exportPath}))`
   */

  try {
    return unzipper.Open.file(jarPath)
      .then((d) => d.extract({ path: exportDirectory }))
      .then(() => assetsPath)
  } catch (e) {
    console.log(`An error occurred while checking for the Jar file.`)
    return ``
  }
}
