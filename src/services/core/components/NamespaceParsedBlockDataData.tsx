import React from "react"
import { Box, Text } from "ink"
import { Tab } from "./shared/Tab"
import { ArrayTextBlock } from "./shared/ArrayTextBlock"
import { BlockPage } from "../../../types/export"

export const NamespaceParsedBlockData = (props: { blockPage: BlockPage }) => {
  const { title } = props.blockPage

  return (
    <>
      <Text bold>
        <Tab count={2} />
        {title}
      </Text>
      <ArrayTextBlock
        label={`Texture file names`}
        nestingDepth={2}
        array={[]} // TODO - remove this since we do things differently now
      />
    </>
  )
}
