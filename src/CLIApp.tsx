import React from "react"
import { Layout } from "./components/Layout"
import { Box, render } from 'ink';
import { MainMenu } from "./components/MainMenu";
import { Text } from 'ink';
import { SetAssetsPathForm } from "./components/SetAssetsPathForm";
import { CACHE, CACHE_CLIENT } from "./cache/cacheClient";
import { generateRawData } from "./minecraft";

const enum OPTION_VALUE {
    SET_ASSETS_DIRECTORY = "set_assets_directory",
    IMPORT_DATA = "import_data",
    INSPECT_DATA = "inspect_data",
    BOOTSTRAP_DATA = "bootstrap_data",
    VIEW_RAW_DATA = "view_raw_data",
    VIEW_PARSED_DATA = "view_parsed_data",
    EXPORT_PARSED_DATA_JSON = "export_parsed_to_json"
}

const enum SUPPORTED_SAVE_LOCATIONS {
    LOCAL,
    CONTENTFUL,
}

type MenuOption = {
    label: string
    value: string
}

export class CLIApp extends React.Component<
{},
{
    options: MenuOption[]
    selectedOption?: string
    contentfulConfig?: {
        clientId: string
        organizationId: string
    }
    rootAssetsPath: string | null
    rawAssetsImported: boolean
    parsedDataGenerated: boolean
}
> {

    async generateCacheLinkedStateValues() {
        const rootAssetsPath = await CACHE.getRootAssetsPath()
        const rawAssetsData = await CACHE.getRawDataFromCache()
        const parsedData = await CACHE.getParsedDataFromCache()

        const data = {
            rootAssetsPath,
            rawAssetsImported: !rawAssetsData,
            parsedDataGenerated: !parsedData
        }

        return data
    }

    constructor(props: any) {
        super(props)
        this.state = {
            options: [
                {
                    label: `Set assets directory`,
                    value: OPTION_VALUE.SET_ASSETS_DIRECTORY
                }
            ],
            parsedDataGenerated: false,
            rawAssetsImported: false,
            rootAssetsPath: ``,
            selectedOption: ``,
        }
    }

    /**
     * Contains logic to decide what options to display in the menu depending on the current values in the cache
     */
    deriveMenuOptionsFromCacheValues(): MenuOption[] {
        const {
            rawAssetsImported,
            parsedDataGenerated,
            rootAssetsPath,
        } = this.state

        const options = [] as MenuOption[]

        if (rootAssetsPath) {
            options.push({
                label: `Bootstrap page objects`,
                value: OPTION_VALUE.BOOTSTRAP_DATA
            })
        }

        if (rawAssetsImported) {
            options.push({
                value: `View raw data`,
                label: OPTION_VALUE.VIEW_RAW_DATA
            })
        }

        if (parsedDataGenerated) {
            options.push({
                label: `View parsed data`,
                value: OPTION_VALUE.VIEW_PARSED_DATA
            })
            options.push({
                label: `Export parsed data to JSON`,
                value: OPTION_VALUE.EXPORT_PARSED_DATA_JSON
            })
        }

        return options
    }

    componentDidMount() {
        this.generateCacheLinkedStateValues().then(({
            rootAssetsPath,
            rawAssetsImported,
            parsedDataGenerated
        }) => {            
            this.setState(prevState => ({
                ...prevState,
                parsedDataGenerated,
                rawAssetsImported,
                rootAssetsPath,
            }))
        }).then(() => {
            // TODO: this seems to work, but see if chaining these state updates in subsequent .then calls is safe
            this.setState(prevState => ({
                options: [
                    ...prevState.options,
                    ...this.deriveMenuOptionsFromCacheValues()
                ]
            }))
        })
    }

    /**
     * Handler to add a new option to the menu list
     * 
     * @param option
     */
    addMenuOptionHandler = (option: { label: string, value: string }) => this.setState( prevState => ({
        ...prevState,
        options: [
            ...prevState.options,
            option
        ]
    }))

    /**
     * Handler to set the root assets path (the one where data will be imported from)
     * 
     * @param assetsPath
     */
    async setRootAssetsPathHandler(assetsPath: string) {
        await CACHE_CLIENT.setRootAssetsPath(assetsPath)
        this.setState({
            ...this.state,
            rootAssetsPath: assetsPath,
        })
        this.setState(prevState => ({
            ...prevState,
            options: [
                ...this.state.options,
                {
                    label: `Bootstrap page objects`,
                    value: OPTION_VALUE.BOOTSTRAP_DATA
                }
            ]
        }))
        this.clearSelectedOptionHandler()
    }

    /**
     * Handler to clear the currently-selected "main menu" option
     * 
     * This is used to control the visibility of the child components. When nothing
     * is selected, the main menu is rendered. When an option is selected, the selected
     * option's specific component is rendered instead of the menu
     */
    clearSelectedOptionHandler = () => this.setState({
        ...this.state,
        selectedOption: undefined
    })

    // TODO: Add an actual context
    /**
     * Sets the selected option in the state of the CLIApp (effectively a "context"-level value)
     * 
     * @param param0 
     */
    async menuSelectHandler(item: { label: string, value: OPTION_VALUE }) {
        switch (item.value) {
            case OPTION_VALUE.SET_ASSETS_DIRECTORY: {
                this.setState({
                    ...this.state,
                    selectedOption: item.value
                })
                break
            }
            case OPTION_VALUE.INSPECT_DATA: {
                this.setState({
                    ...this.state,
                    selectedOption: item.value
                })
                break
            }
            case OPTION_VALUE.IMPORT_DATA: {
                // Don't change menu layout for this; we should already have the assets directory set AND the raw data
                break
            }
            case OPTION_VALUE.BOOTSTRAP_DATA: {
                await CACHE_CLIENT.parseImportedData()
                break
            }
        }
    }

    // Only used whenever we need to remove an option from the menu
    overrideMenuOptions = (options: { label: string, value: string }[]) => this.setState({
        ...this.state,
        options
    })

    /**
     * Returns true if the user has a currently-selected Main Menu option
     * 
     * We should use this to control the visibility of the MainMenu component. When an option
     * is selected, we should render that option-specific component
     */
    hasSelectedOption = () => (this.state.selectedOption && this.state.selectedOption.length > 0)

    /**
     * Renders a sub-menu/form/page depending on the current selection
     */
    renderSelectedOptionMenu = () => {
        switch(this.state.selectedOption) {
            case OPTION_VALUE.SET_ASSETS_DIRECTORY: {
                return <SetAssetsPathForm 
                            clearSelectedOptionHandler={this.clearSelectedOptionHandler.bind(this)}
                            setRootAssetsPathHandler={this.setRootAssetsPathHandler.bind(this)}
                        />
            }
            case OPTION_VALUE.IMPORT_DATA: {

            }
            case OPTION_VALUE.INSPECT_DATA: {
                return (
                    <>
                    </>
                )
            }
            default: {
                return (
                    <>
                    </>
                )
            }
        }
    }

    render() {
        return (
            <>
                <Layout>
                    
                    {this.hasSelectedOption() ? this.renderSelectedOptionMenu() : 
                        <MainMenu options={this.state.options} onSelectHandler={this.menuSelectHandler.bind(this)} />
                    }
                    <Box marginTop={4}>
                        <Text color="blue">Session Details</Text>
                    </Box>
                    <Box marginLeft={1}>
                        <Text>Assets path: {this.state.rootAssetsPath ? this.state.rootAssetsPath : `-`}</Text>
                    </Box>
                    {/* TODO: Make these checks listen to booleans in the state - state can't be tied to the data as we can't reliably set-and-get (it's weirdly async - can't be awaited) */}
                    {/* <Box marginLeft={1}>
                        <Text>Data imported: {this.state.rawData ? <Text> ✔️</Text> : <Text> ✖️</Text>}</Text>
                    </Box>
                    <Box marginLeft={1}>
                        <Text>Data parsed: {this.state.parsedData ? <Text> ✔️</Text> : <Text> ✖️</Text>}</Text>
                    </Box> */}
                </Layout>
            </>
        )
    }
    
}

render(<CLIApp />)
