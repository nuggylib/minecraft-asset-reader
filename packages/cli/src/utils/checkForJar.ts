const fs = require(`fs`)
const os = require(`os`)
const { join } = require(`path`)
const systemUser = os.userInfo().username

let jarDir = ``
let jarExists = false

export interface Item<V> {
  key?: string
  label: string
  value: V
}

const currentOs = os.type()
const minecraftVersion = `1.12.2`

const linuxJar = `/home/${systemUser}/.minecraft/versions/${minecraftVersion}/${minecraftVersion}.jar`
const darwinJar = `~/Library/Application Support/minecraft/versions/${minecraftVersion}/${minecraftVersion}.jar`
const winJar = `%appdata%\\.minecraft\\versions\\${minecraftVersion}\\${minecraftVersion}.jar`

export function checkForJar() {
  let os: any = currentOs
  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxJar)) {
          jarDir = linuxJar
          console.log(
            `Found Minecraft jar for version ${minecraftVersion}: `,
            linuxJar
          )
          jarExists = true
        } else {
          console.error(
            `Minecraft jar for version ${minecraftVersion} does not exist.`
          )
          jarExists = false
        }
      } catch (e) {
        console.error(
          `An error occurred while checking for the Minecraft jar for version ${minecraftVersion}.`,
          e
        )
        jarExists = false
      }
      break
    case `Darwin`:
      try {
        if (fs.existsSync(darwinJar)) {
          console.log(
            `Found Minecraft jar for version ${minecraftVersion}: `,
            darwinJar
          )
          jarDir = darwinJar
          jarExists = true
        } else {
          console.error(
            `Minecraft jar for version ${minecraftVersion} does not exist.`
          )
          jarExists = false
        }
      } catch (e) {
        console.error(
          `An error occurred while checking for the Minecraft jar for version ${minecraftVersion}.`,
          e
        )
        jarExists = false
      }
      break
    case `Windows_NT`:
      try {
        if (fs.existsSync(winJar)) {
          console.log(
            `Found Minecraft jar for version ${minecraftVersion}: `,
            winJar
          )
          jarDir = winJar
          jarExists = true
        } else {
          console.error(
            `Minecraft  jar for version ${minecraftVersion} does not exist.`
          )
          jarExists = false
        }
      } catch (e) {
        console.error(
          `An error occurred while checking for the Minecraft jar for version ${minecraftVersion}.`,
          e
        )
        jarExists = false
      }
      break
    default:
      console.log(
        `Fell through to default when checking for Minecraft jar for version ${minecraftVersion}.`
      )
      jarExists = false
  }
  return jarExists
}
