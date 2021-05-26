import React, { useEffect } from "react"
import SelectInput, { Item } from "ink-select-input"
import { useState } from "react"
import { checkForAssets, detectVersions } from "../../../utils"
import { Box, Text } from "ink"
import { CACHE } from "../../../main"
import { MinecraftUtility } from "../../../minecraft"

const minecraftAssetReader = new MinecraftUtility()
export interface Item<V> {
  key?: string
  label: string
  value: V
}

export const SetMinecraftVersion = (props: {
  clearSelectedOptionHandler: () => void
  setRawAssetsPathHandler: (v: string) => void
}) => {
  const [minecraftVersions, setMinecraftVersions] = useState()
  const [selectedVersion, setSelectedVersion] = useState(``)

  const selectHandler = (value: any) => {
    setSelectedVersion(value)
    if (value) {
      props.clearSelectedOptionHandler()
    }
  }

  useEffect(() => {
    /**
     * @see https://stackoverflow.com/questions/53332321/react-hook-warnings-for-async-function-in-useeffect-useeffect-function-must-ret
     */
    async function setData() {
      let minecraftVersionsArray: any

      detectVersions()
        .then((v) => (minecraftVersionsArray = v))
        .then(() => {
          setMinecraftVersions(minecraftVersionsArray)
        })
        .then(() => {
          checkForAssets(selectedVersion).then((path) => {
            if (path) {
              try {
                minecraftAssetReader.readInRawData({
                  path,
                })
                CACHE.setRootAssetsPath(path)
                props.setRawAssetsPathHandler(path)
              } catch (e) {
                console.log(`Unable to read in raw data: `, e.message)
              }
            } else {
              console.error(`path did not exist when passed to readInRawData`)
            }
          })
        })
    }

    setData()
  }, [selectedVersion, minecraftVersions])

  return (
    <>
      <Box>
        <Text>Select the Minecraft version you want to use: </Text>
      </Box>
      {!!minecraftVersions ? (
        <SelectInput
          items={minecraftVersions}
          onSelect={(item) => selectHandler(item)}
        />
      ) : (
        <Text>...</Text>
      )}
    </>
  )
}
