const fs = require(`fs`)
const os = require(`os`)
const systemUser = os.userInfo().username

const currentOs = os.type()

export async function checkForAssets(selectedVersion: {
  label: string
  value: string
}) {
  const linuxAssets = `/home/${systemUser}/.minecraft/versions/${selectedVersion.value}/assets`
  const darwinAssets = `~/Library/Application Support/minecraft/versions/${selectedVersion.value}/assets`
  const winAssets = `%appdata%\\.minecraft\\versions\\${selectedVersion.value}\\assets`

  let assetsPath = (null as unknown) as string

  switch (currentOs) {
    case `Linux`:
      if (fs.existsSync(linuxAssets)) {
        assetsPath = linuxAssets
      }
      break
    case `Darwin`:
      if (fs.existsSync(darwinAssets)) {
        assetsPath = darwinAssets
      }
      break
    case `Windows_NT`:
      if (fs.existsSync(winAssets)) {
        assetsPath = winAssets
      }
      break
    default: {
      break
    }
  }
  return assetsPath
}
