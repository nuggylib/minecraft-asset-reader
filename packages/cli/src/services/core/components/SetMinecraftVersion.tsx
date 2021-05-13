// import { Box, Text, render } from "ink"
import React, { useEffect } from "react"
import SelectInput, { Item, ItemProps } from "ink-select-input"
import { useState } from "react"
import { checkForAssets, detectVersions } from "../../../utils"
import { Box, Text } from "ink"
import { CACHE } from "../../../main"
import { MinecraftUtility } from "../../minecraft"
// import { MinecraftUtility } from "../../minecraft/minecraftUtility"
// import { Item } from 'ink-select-input/build/SelectInput';

const minecraftAssetReader = new MinecraftUtility()

type ChoiceValue = any
interface ChoiceOption {
  key?: string
  label: string
  value: ChoiceValue
}
export interface Item<V> {
  key?: string
  label: string
  value: V
}

export const SetMinecraftVersion = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  let minecraftVersions: ChoiceOption[]
  detectVersions().then((v) => (minecraftVersions = v))
  const [selectedOption, setSelectedOption] = useState(
    (null as unknown) as string
  )
  const clearSelectedOptionHandler = () =>
    setSelectedOption((null as unknown) as string)

  const [selectedVersion, setSelectedVersion] = useState(``)
  const [rawAssetsPath, setRawAssetsPath] = useState(``)
  // const minecraftAssetReader = new MinecraftUtility()
  // const versionsArray = detectVersions()

  const selectHandler = (value: any) => {
    setSelectedVersion(value)
  }

  useEffect(() => {
    checkForAssets(selectedVersion, { clearSelectedOptionHandler }).then(
      (path) => {
        if (path) {
          minecraftAssetReader.readInRawData({
            path,
          })
          CACHE.setRootAssetsPath(path)
          setRawAssetsPath(path)
          props.clearSelectedOptionHandler()
        } else {
          console.log(`path did not exist when passed to readInRawData`)
          props.clearSelectedOptionHandler()
        }
      }
    )
  })

  return (
    <>
      <Box>
        <Text>Select the Minecraft version you want to use: </Text>
      </Box>
      <SelectInput
        items={minecraftVersions}
        onSelect={(item) => selectHandler(item)}
      />
    </>
  )
}
