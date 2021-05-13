import { ItemProps, Item } from "ink-select-input"
import { readdir } from "node:fs"
import { useState } from "react"
const fs = require(`fs`)
const os = require(`os`)
const { join } = require(`path`)
const systemUser = os.userInfo().username

type ChoiceValue = any
interface ChoiceOption {
  key?: string
  label: string
  value: ChoiceValue
}

let versionsDir = ``
let versionsArray: ChoiceOption[] = []
export interface Item<V> {
  key?: string
  label: string
  value: V
}

const currentOs = os.type()

const linuxVersions = `/home/${systemUser}/.minecraft/versions/`
const darwinVersions = `~/Library/Application Support/minecraft/versions/`
const winVersions = `%appdata%\\.minecraft\\versions\\`

export async function detectVersions() {
  let os: any = currentOs
  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxVersions)) {
          versionsDir = linuxVersions
          try {
            const installations = fs.readdirSync(versionsDir)
            for (const version of installations) {
              if (
                version.match(/([1-9]\.[1-9])/g) &&
                !versionsArray.find((v: any) => v.value === version)
              ) {
                let versionOption = {
                  label: `${version}`,
                  value: `${version}`,
                }
                versionsArray.push(versionOption)
              }
            }
            console.log(`versions Array: `, versionsArray)
            return versionsArray
          } catch (e) {
            console.error(e)
          }
          console.log(`Found Minecraft installations: `, linuxVersions)
        } else {
          console.log(`Minecraft installations directory does not exist.`)

          versionsDir = linuxVersions
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the Minecraft installations directory.`,
          e
        )
      }
      break
    case `Darwin`:
      // try {
      //   if (fs.existsSync(darwinVersions)) {
      //     console.log(`Found Minecraft installations: `, darwinVersions)
      //     versionsDir = darwinVersions
      //     return versionsDir
      //   } else {
      //     console.log(`Minecraft installations directory does not exist.`)

      //     versionsDir = darwinVersions
      //     // return versionsDir
      //   }
      // } catch (e) {
      //   console.log(
      //     `An error occurred while checking for the Minecraft installations directory.`
      //   )
      // }
      break
    case `Windows_NT`:
      // try {
      //   if (fs.existsSync(winVersions)) {
      //     console.log(`Found Minecraft installations: `, winVersions)
      //     versionsDir = winVersions
      //     return versionsDir
      //   } else {
      //     console.log(`Minecraft installations directory does not exist.`)

      //     versionsDir = winVersions
      //     // return versionsDir
      //   }
      // } catch (e) {
      //   console.log(
      //     `An error occurred while checking for the Minecraft installations directory.`
      //   )
      // }
      break
    default:
      console.log(`Fell through to default`)
  }
  return versionsArray
}
