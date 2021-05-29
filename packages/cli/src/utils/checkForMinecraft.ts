const fs = require(`fs`)
const os = require(`os`)
const { join } = require(`path`)
const systemUser = os.userInfo().username

let minecraftDir = ``
let dirExists = false

const nixExpression = new RegExp(/(\/\.?minecraft\/versions\/[\S]*\/[\S]*.jar)/)
const winExpression = new RegExp(/(\.minecraft\\versions\\[\S]*\\[\S]*.jar)/)

export interface Item<V> {
  key?: string
  label: string
  value: V
}

const currentOs = os.type()
console.log(`Current OS detected: `, currentOs)
const minecraftVersion = ``

const linuxDir = `/home/${systemUser}/.minecraft/`
const darwinDir = `~/Library/Application Support/minecraft/`
const winDir = `%appdata%\\.minecraft\\`

export function checkForMinecraft() {
  let os: any = currentOs
  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxDir)) {
          minecraftDir = linuxDir

          dirExists = true
        } else {
          console.error(
            `Default Minecraft installation directory does not exist.`
          )
          dirExists = false
        }
      } catch (e) {
        console.error(`An error occurred while checking for Minecraft.`, e)
        dirExists = false
      }
      break
    case `Darwin`:
      try {
        if (fs.existsSync(darwinDir)) {
          minecraftDir = darwinDir
          dirExists = true
        } else {
          console.error(
            `Default Minecraft installation directory does not exist.`
          )
          dirExists = false
        }
      } catch (e) {
        console.error(`An error occurred while checking for Minecraft.`, e)
        dirExists = false
      }
      break
    case `Windows_NT`:
      try {
        if (fs.existsSync(winDir)) {
          minecraftDir = winDir
          dirExists = true
        } else {
          console.error(
            `Default Minecraft installation directory does not exist.`
          )
          dirExists = false
        }
      } catch (e) {
        console.error(`An error occurred while checking for Minecraft.`, e)
        dirExists = false
      }
      break
    default:
      console.log(`Fell through to default case while checking for Minecraft.`)
      dirExists = false
  }
  return dirExists
}
