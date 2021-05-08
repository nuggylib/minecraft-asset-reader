const fs = require(`fs`)
const os = require(`os`)
const systemUser = os.userInfo().username
import { extractJar } from "./index"

let defaultDir = ``
// Constants
const currentOs = os.type()
// TODO: Prompt for version

// checkForAssets() gets the current operating system (OS),
// then checks if the default assets directory for the OS
// exists. If it doesn't exist, it tries to find the default Minecraft
// Jar file. if the Jar file exists, it extracts it (creating the default
// assets directory). In either case, the result is that it
// returns the default assets directory based on the current OS.
// TODO: Add logic to handle if the Jar file doesn't exist
// TODO: If it falls through or fails, return to the main menu.
export async function checkForAssets(version: any) {
  let minecraftVersion = version
  const linuxJar = `/home/${systemUser}/.minecraft/versions/${minecraftVersion}/${minecraftVersion}.jar`
  const darwinJar = `~/Library/Application Support/minecraft/versions/${minecraftVersion}/${minecraftVersion}.jar`
  const winJar = `%appdata%\\.minecraft\\versions\\${minecraftVersion}\\${minecraftVersion}.jar`
  const linuxAssets = `/home/${systemUser}/.minecraft/versions/${minecraftVersion}/assets`
  const darwinAssets = `~/Library/Application Support/minecraft/versions/${minecraftVersion}/assets`
  const winAssets = `%appdata%\\.minecraft\\versions\\${minecraftVersion}\\assets`

  const linuxExportDir = `/home/${systemUser}/.minecraft/versions/${minecraftVersion}/`
  const darwinExportDir = `~/Library/Application Support/minecraft/versions/${minecraftVersion}/`
  const winExportDir = `%appdata%\\.minecraft\\versions\\${minecraftVersion}\\`
  let os: any = currentOs
  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxAssets)) {
          defaultDir = linuxAssets
          console.log(`Assets directory exists: `, linuxAssets)
        } else {
          console.log(`Assets directory does not exist.`)
          console.log(`Extracting jar...`)
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
          console.log(`Assets directory does not exist.`)
          console.log(`Extracting jar...`)
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
          console.log(`Assets directory does not exist.`)
          console.log(`Extracting jar...`)
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
      // TODO: Prompt for default directory
      console.log(`Fell through to default`)
  }
  return defaultDir
}
