import React from "react"
import { Box, Text } from "ink"
import { BlockPage } from "../types"
import { Tab } from "./shared/Tab"
import { ArrayTextBlock } from "./shared/ArrayTextBlock"

export const NamespaceParsedBlockData = (props: { blockPage: BlockPage }) => {
  const { title, textureNames } = props.blockPage

  return (
    <>
      <Text bold>
        <Tab count={2} />
        {title}
      </Text>
      <ArrayTextBlock
        label={`Texture file names`}
        nestingDepth={2}
        array={textureNames}
      />
    </>
  )
}
