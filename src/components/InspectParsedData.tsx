import { Box, Text } from "ink"
import React from "react"
import { CACHE } from "../cache/cacheClient"
import { BlockPage, ParsedData } from "../types"
import { NamespaceParsedBlockData } from "./NamespaceParsedData"
import TextInput from 'ink-text-input';
export class InspectParsedData extends React.Component<
{
    // props
    clearSelectedOptionHandler: () => void
},
{
    // state
    parsedData: ParsedData
    input: string
}> {

    constructor(props: any) {
        super(props)
        this.state = {
            input: ``,
            parsedData: {}
        }
    }

    /**
     * Decides what to do after the user has submitted their input
     * 
     * @param value 
     */
    submitHandler(value: string) {
        if(value === `q`) {
            this.props.clearSelectedOptionHandler()
        }
    }

    setInputHandler = (input: any) => {
        this.setState({
            ...this.state,
            input
        })
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
            <Box>
                <Text>What would you like to do: </Text>
                <TextInput value={this.state.input} onChange={this.setInputHandler} onSubmit={(value: string) => this.submitHandler(value)} placeholder={`enter command`} />
            </Box>
            
        </>
        )
    }
}