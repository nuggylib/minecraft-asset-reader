import { Box, Text } from "ink"
import React from "react"
import { CACHE } from "../cache/cacheClient"
import { BlockPage, ParsedData } from "../types"
import { NamespaceParsedBlockData } from "./NamespaceParsedData"

export class InspectParsedData extends React.Component<
{
    // props
    clearSelectedOptionHandler: () => void
},
{
    // state
    parsedData: ParsedData
}> {

    constructor(props: any) {
        super(props)
        this.state = {
            parsedData: {}
        }
    }

    componentDidMount() {
        CACHE.getParsedDataFromCache().then(parsedData => this.setState( prevState => ({
            ...prevState,
            parsedData,
        })))
    }

    render() {
        
        const {
            parsedData
        } = this.state

        // Array of namespaces in the parsed data
        const parsedDataNamespaces = Object.keys(parsedData)

        return (
            <>
            {(parsedDataNamespaces.length > 0) ?  
                parsedDataNamespaces.map(namespace => (
                    <Box key={namespace} flexDirection="column">
                        <Text color="magentaBright" bold>{namespace}</Text>
                        {parsedData[namespace].blockPages ? 
                            parsedData[namespace].blockPages!.map((blockPage: BlockPage) => <NamespaceParsedBlockData blockPage={blockPage} />)
                        : null }
                    </Box>
                ))
            : <Text>NO DATA</Text> }
        </>
        )
    }
}