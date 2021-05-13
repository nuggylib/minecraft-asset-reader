// import { Box, Text, render } from "ink"
import React, { useEffect } from "react"
import SelectInput, { Item, ItemProps } from "ink-select-input"
import { useState } from "react"
import { detectVersions } from "../../../utils"
// import { MinecraftUtility } from "../../minecraft/minecraftUtility"
// import { Item } from 'ink-select-input/build/SelectInput';

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

let minecraftVersions: ChoiceOption[]
detectVersions().then((v) => (minecraftVersions = v))

export const SetMinecraftVersion = () => {
  const [versions, setVersions] = useState([] as Item<unknown>[])
  const [version, setVersion] = useState(``)
  // const minecraftAssetReader = new MinecraftUtility()
  // const versionsArray = detectVersions()

  const selectHandler = (value: any) => value

  // useEffect(() => {
  //   detectVersions().then((versions) => {
  //     setVersions(versions!)
  //   })
  // }, [])

  return (
    <SelectInput items={minecraftVersions} onSelect={selectHandler(Item)} />
  )
}
