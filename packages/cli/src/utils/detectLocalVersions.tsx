import { readdir } from "node:fs"
import { useState } from "react"
const fs = require(`fs`)
const os = require(`os`)
const { join } = require(`path`)
const systemUser = os.userInfo().username
import { Box, Text, render } from "ink"
import React from "react"
import SelectInput, { Item } from "ink-select-input"

let versionsDir = ``
let versionsArray: Item<unknown>[] = []
const [versions, setVersions] = useState([] as Item<unknown>[])
const [version, setVersion] = useState(``)

const currentOs = os.type()

const linuxVersions = `/home/${systemUser}/.minecraft/versions/`
const darwinVersions = `~/Library/Application Support/minecraft/versions/`
const winVersions = `%appdata%\\.minecraft\\versions\\`

export interface Item<V> {
  key?: string
  label: string
  value: V
}

export async function detectVersions() {
  let os: any = currentOs
  switch (os) {
    case `Linux`:
      try {
        if (fs.existsSync(linuxVersions)) {
          versionsDir = linuxVersions
          try {
            const installations = await fs.readdir(versionsDir)
            for (const version of installations) {
              let versionOption = {
                label: `${version}`,
                value: `${version}`,
              }
              versionsArray.push(versionOption)
            }
            console.log(`versions Array: `, versionsArray)
            setVersions(versionsArray)

            const handleVersionSelect = (version: any) => {
              console.log(`Version select: `, version)
              setVersion(version)
              return version
            }

            return (
              <SelectInput
                items={versionsArray}
                onSelect={handleVersionSelect(Item)}
              />
            )
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
          `An error occurred while checking for the Minecraft installations directory.`
        )
      }
      break
    case `Darwin`:
      try {
        if (fs.existsSync(darwinVersions)) {
          console.log(`Found Minecraft installations: `, darwinVersions)
          versionsDir = darwinVersions
          return versionsDir
        } else {
          console.log(`Minecraft installations directory does not exist.`)

          versionsDir = darwinVersions
          return versionsDir
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the Minecraft installations directory.`
        )
      }
      break
    case `Windows_NT`:
      try {
        if (fs.existsSync(winVersions)) {
          console.log(`Found Minecraft installations: `, winVersions)
          versionsDir = winVersions
          return versionsDir
        } else {
          console.log(`Minecraft installations directory does not exist.`)

          versionsDir = winVersions
          return versionsDir
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the Minecraft installations directory.`
        )
      }
      break
    default:
      console.log(`Fell through to default`)
  }
  return versionsDir
}
