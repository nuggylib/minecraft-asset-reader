// import { Box, Text, render } from "ink"
import React, { useEffect } from "react"
import SelectInput, { Item, ItemProps } from "ink-select-input"
import { useState } from "react"
import { detectVersions } from "../../../utils"
// import { MinecraftUtility } from "../../minecraft/minecraftUtility"
// import { Item } from 'ink-select-input/build/SelectInput';

export interface Item<V> {
  key?: string
  label: string
  value: V
}

export const SetMinecraftVersion = () => {
  const [versions, setVersions] = useState([] as Item<unknown>[])
  const [version, setVersion] = useState(``)
  // const minecraftAssetReader = new MinecraftUtility()
  // const versionsArray = detectVersions()

  const selectHandler = (value: any) => value

  useEffect(() => {
    detectVersions().then((versions) => {
      setVersions(versions!)
    })
  }, [])

  return <SelectInput items={versions} onSelect={selectHandler(Item)} />
}
