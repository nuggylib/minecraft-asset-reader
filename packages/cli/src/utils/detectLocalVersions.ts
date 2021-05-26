const fs = require(`fs`)
const os = require(`os`)
const systemUser = os.userInfo().username

type ChoiceValue = any
interface ChoiceOption {
  key?: string
  label: string
  value: ChoiceValue
}

let versionsDir = ``
let versionsArray: ChoiceOption[] = []

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
            return versionsArray
          } catch (e) {
            console.error(e)
          }
        } else {
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
      try {
        if (fs.existsSync(darwinVersions)) {
          versionsDir = darwinVersions
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
            return versionsArray
          } catch (e) {
            console.error(e)
          }
        } else {
          console.log(`Minecraft installations directory does not exist.`)

          versionsDir = darwinVersions
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the Minecraft installations directory.`,
          e
        )
      }
      break
    case `Windows_NT`:
      try {
        if (fs.existsSync(winVersions)) {
          versionsDir = winVersions
          try {
            const installations = fs.readdirSync(versionsDir)
            for (const version of installations) {
              if (
                version.match(/([1-9]\/.[1-9])/g) &&
                !versionsArray.find((v: any) => v.value === version)
              ) {
                let versionOption = {
                  label: `${version}`,
                  value: `${version}`,
                }
                versionsArray.push(versionOption)
              }
            }
            return versionsArray
          } catch (e) {
            console.error(e)
          }
        } else {
          versionsDir = winVersions
        }
      } catch (e) {
        console.log(
          `An error occurred while checking for the Minecraft installations directory.`,
          e
        )
      }
      break
    default: {
      break
    }
  }
  return versionsArray
}
