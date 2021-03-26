import { Box, Text,  } from "ink"
import React from "react"
import { CACHE } from "../cache/cacheClient"
import { BlockPage, ParsedData } from "../types"
import TextInput from 'ink-text-input';
import { Exporter } from "../export/exporter"


const enum EXPORT_OPTION_VALUE {
    SAVE_AS_JSON = "save_as_json",
    SAVE_AS_FILES = "save_as_files",
}

export class ExportParsedData extends React.Component<
{
    // props
    clearSelectedOptionHandler: () => void
    
    
},
{
    // state
    parsedData: ParsedData
    input: string
    exportOption?: string
}> {

    constructor(props: any) {
        super(props)
        this.state = {
            input: ``,
            parsedData: {},
            exportOption: ``
        }
    }

    async SelectExportDataHandler(option: string) {
        switch(option) {
            case EXPORT_OPTION_VALUE.SAVE_AS_FILES: {
                const success = await new Exporter().
                exportParsedDataToLocalFilesystem({createSeparatePageFiles: true})
                console.log(`Export succeeded: `, success)
                break
            }
            case EXPORT_OPTION_VALUE.SAVE_AS_JSON: {
                const success = await new Exporter().
                exportParsedDataToLocalFilesystem({})
                console.log(`Export succeeded: `, success)
                break
            }
            default: {
                console.log(`No option selected`)
                return (
                    <> </>
                )
            }
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
        else if(value === `1`) {
            this.SelectExportDataHandler(EXPORT_OPTION_VALUE.SAVE_AS_JSON)
        }
       else if(value === `2`) {
            this.SelectExportDataHandler(EXPORT_OPTION_VALUE.SAVE_AS_FILES)
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
                <Box flexDirection="column">
                    <Text>How would you like to export? Enter 1 or 2: </Text>
                    <Text>1. Save data as JSON</Text>
                    <Text>2. Save data as separate files</Text>
                    
                    <TextInput value={this.state.input} onChange={this.setInputHandler} onSubmit={(value: string) => this.submitHandler(value)} placeholder={`Enter option: `} />
                </Box>

            : <Text>NO DATA</Text> }
            
            
        </>
        )
    }
}