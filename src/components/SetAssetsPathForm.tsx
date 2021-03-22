import { Box, Text } from "ink"
import React from "react"
import TextInput from 'ink-text-input';
import { generateRawData, validatesAssetsDirectory } from "../minecraft";
import { CACHE_CLIENT } from "../cache/cacheClient";

export class SetAssetsPathForm extends React.Component<{
    setRootAssetsPathHandler: any
    clearSelectedOptionHandler: () => void
}, {
    input: string
    inputIsValid: boolean
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            input: ``,
            inputIsValid: false
        }
    }

    submitHandler(value: string) {
        if(value === `q`) {
            this.props.clearSelectedOptionHandler()
        } else {
            this.props.setRootAssetsPathHandler(this.state.input)
            generateRawData({ path: this.state.input, setRawDataHandler: CACHE_CLIENT.setRawData })
        }
        
    }

    setInputHandler = (input: any) => {
        this.setState({
            ...this.state,
            input
        })
        var lastPart = this.state.input.split("/").pop()
        if ((
            lastPart === 'assets' && validatesAssetsDirectory({ path: input })) || 
            input === `q`
        ) {
            this.setState({
                ...this.state,
                inputIsValid: true,
            })
        } else {
            this.setState({
                ...this.state,
                inputIsValid: false,
            })
        }
    }

    render() {
        return (
            <>
                <Box marginLeft={1}>
                    <Text bold color="blue">Import Data</Text>
                </Box>
                <Box justifyContent="flex-start" marginLeft={2}>
                    <Text>➡️  Enter path to 'assets' directory:</Text>
                    {this.state.inputIsValid ? <Text> ✔️  </Text> : <Text> ✖️  </Text> }
                    <TextInput key="" value={this.state.input} onChange={this.setInputHandler} onSubmit={(value: string) => this.submitHandler(value)}/>
                </Box>
                <Box marginLeft={1}>
                    {(!this.state.inputIsValid && this.state.input.length !== 0) ? 
                        <Text color="red">The path must end in 'assets' and must contain valid texture packs (separated by namespace)</Text> : 
                        null
                    }
                </Box>
            </>
        )
    }
}