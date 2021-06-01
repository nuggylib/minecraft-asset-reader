import React, { useEffect } from "react"
import SelectInput, { Item } from "ink-select-input"
import { useState } from "react"
import { checkForAssets, detectVersions, extractJar } from "../utils"
import { Box, Text } from "ink"
import { MinecraftUtility } from "../minecraft"
import { Dao } from "../db"
import { LoadingIndicator } from "./shared/LoadingIndicator"

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
  const [loadingText, setLoadingText] = useState(``)

  const selectHandler = (value: { label: string; value: string }) => {
    if (value) {
      setLoadingText(`Checking for assets directory...`)
      checkForAssets(value)
        .then((assetsPath) => {
          if (!!assetsPath) {
            return assetsPath
          } else {
            setLoadingText(`Extracting jar contents...`)
            return extractJar(value.value)
          }
        })
        .then((path) => {
          if (path) {
            try {
              setLoadingText(`Reading in raw data...`)
              minecraftAssetReader.readInRawData({
                path,
              })
              props.setRawAssetsPathHandler(path)
            } catch (e) {
              console.log(`Unable to read in raw data: `, e.message)
            }
          } else {
            console.error(`path did not exist when passed to readInRawData`)
          }
        })
        .then(() => {
          setLoadingText(`Loading game version data...`)
          return Dao(value.value)
        })
        .then((db) => db.initGameVersionDatabase())
        .then((_initDbResult) => Dao())
        .then((db) => db.addImportedGameVersion(value.value))
        .then(() => {
          props.clearSelectedOptionHandler()
        })
    }
  }

  useEffect(() => {
    let isCancelled = false
    let minecraftVersionsArray: any

    detectVersions()
      .then((v) => (minecraftVersionsArray = v))
      .then(() => {
        if (!isCancelled) {
          setMinecraftVersions(minecraftVersionsArray)
        }
      })

    // Used to prevent attempting to set state when component is unmounted
    return () => {
      isCancelled = true
    }
  }, [minecraftVersions])

  return (
    <>
      <Box>
        <Text>Select the Minecraft version you want to use: </Text>
      </Box>
      {!!minecraftVersions ? (
        <SelectInput
          items={minecraftVersions}
          onSelect={(item) =>
            selectHandler(item as { label: string; value: string })
          }
        />
      ) : (
        <Text>...</Text>
      )}
      {loadingText.length > 0 ? (
        <LoadingIndicator loadingText={loadingText} />
      ) : null}
    </>
  )
}
