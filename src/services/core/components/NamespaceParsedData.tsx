import { Box, Text } from "ink"
import React from "react"
import { BlockPage } from "../../../types/export"
import { Tab } from "./shared/Tab"

/**
 * This component renders each BlockPage when the
 * user displays the parsed data.
 */
export class NamespaceParsedBlockData extends React.Component<
  {
    // props
    blockPage: BlockPage
  },
  {
    // state
  }
> {
  render() {
    const {
      title,
      // textureNames
    } = this.props.blockPage

    return (
      <>
        <Text bold>
          <Tab count={2} />
          {title}
        </Text>
        {/* <ArrayTextBlock label={"Texture file names"} nestingDepth={2} array={textureNames}/> */}
      </>
    )
  }
}
