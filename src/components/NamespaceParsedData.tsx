import { Box, Text } from "ink"
import React from "react"
import { BlockPage } from "../types"
import { ArrayTextBlock } from "./shared/ArrayTextBlock"
import { Tab } from "./shared/Tab"



export class NamespaceParsedBlockData extends React.Component<
{
    // props
    blockPage: BlockPage
}, 
{
    // state
}> {
    render() {

        const {
            title,
            models,
            variantModelNames,
            textureNames
        } = this.props.blockPage

        return (
            <>
                <Text bold><Tab count={2}/>{title}</Text>
                <ArrayTextBlock label={"Model file names"} nestingDepth={2} array={models}/>
                <ArrayTextBlock label={"Variant model file names"} nestingDepth={2} array={variantModelNames ? variantModelNames : []}/>
                <ArrayTextBlock label={"Texture file names"} nestingDepth={2} array={textureNames}/>
            </>
        )
    }
}