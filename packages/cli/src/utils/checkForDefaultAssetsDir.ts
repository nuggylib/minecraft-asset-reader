const fs = require(`fs`)
const os = require(`os`)
const systemUser = os.userInfo().username
import { extractJar } from "./index"

let defaultDir = ``
const currentOs = os.type()

/**
 *
 * @param selectedVersion
 * @param props
 * @returns defaultDir or fallbackDefaultDir
 *
 * checkForAssets() gets the current operating system (OS),
 * then checks if the default assets directory for the OS
 * exists. If it doesn't exist, it tries to find the default Minecraft
 * Jar file. if the Jar file exists, it extracts it (creating the default
 * assets directory). In either case, the result is that it
 * returns the default assets directory based on the current OS.
 */

// TODO: Add logic to handle if the Jar file doesn't exist
// TODO: If it falls through or fails, return to the main menu.

export async function checkForAssets(
  selectedVersion: any,
  props: {
    clearSelectedOptionHandler: () => void
  }
) {
  const fallbackDefaultDir = `/home/${systemUser}/.minecraft/versions/1.12.2/assets`
  const linuxJar = `/home/${systemUser}/.minecraft/versions/${selectedVersion.value}/${selectedVersion.value}.jar`
  const darwinJar = `~/Library/Application Support/minecraft/versions/${selectedVersion.value}/${selectedVersion.value}.jar`
  const winJar = `%appdata%\\.minecraft\\versions\\${selectedVersion.value}\\${selectedVersion.value}.jar`
  const linuxAssets = `/home/${systemUser}/.minecraft/versions/${selectedVersion.value}/assets`
  const darwinAssets = `~/Library/Application Support/minecraft/versions/${selectedVersion.value}/assets`
  const winAssets = `%appdata%\\.minecraft\\versions\\${selectedVersion.value}\\assets`
  const linuxExportDir = `/home/${systemUser}/.minecraft/versions/${selectedVersion.value}/`
  const darwinExportDir = `~/Library/Application Support/minecraft/versions/${selectedVersion.value}/`
  const winExportDir = `%appdata%\\.minecraft\\versions\\${selectedVersion.value}\\`
  let os: string = currentOs

  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxAssets)) {
          defaultDir = linuxAssets
          console.log(`Assets directory exists: `, linuxAssets)
        } else {
          console.log(`Assets directory does not exist. \nExtracting jar...`)
          await extractJar(linuxJar, linuxExportDir)
          defaultDir = linuxAssets
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the assets directory.`
        )
      }
      break
    case `Darwin`:
      try {
        if (fs.existsSync(darwinAssets)) {
          console.log(`Assets directory exists: `, darwinAssets)
          defaultDir = darwinAssets
          return defaultDir
        } else {
          console.log(`Assets directory does not exist. \nExtracting jar...`)
          extractJar(darwinJar, darwinExportDir)
          defaultDir = darwinAssets
          return defaultDir
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the assets directory.`
        )
      }
      break
    case `Windows_NT`:
      try {
        if (fs.existsSync(winAssets)) {
          console.log(`Assets directory exists: `, winAssets)
          defaultDir = winAssets
          return defaultDir
        } else {
          console.log(`Assets directory does not exist. \nExtracting jar...`)
          extractJar(winJar, winExportDir)
          defaultDir = winAssets
          return defaultDir
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the assets directory.`
        )
      }
      break
    default:
      console.log(`Fell through to default case`)
  }
  if (selectedVersion) {
    return defaultDir
  } else {
    //  TODO: Instead of using a fallback directory, redirect the user to the main prompt.

    console.log(
      `selectedVersion is empty, using fallbackDefaultDir: `,
      fallbackDefaultDir
    )
    return fallbackDefaultDir
  }
}
