import React from "react"
import { Layout } from "./components/Layout"
import { Box, render } from 'ink';
import { MainMenu } from "./components/MainMenu";
import { Text } from 'ink';
import { SetAssetsPathForm } from "./components/SetAssetsPathForm";
import { CACHE, CACHE_CLIENT } from "./cache/cacheClient";
import { InspectParsedData } from "./components/InspectParsedData";

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

    constructor(props: any) {
        super(props)
        this.state = {
            // No options specified by default - let the cache dictate what options should render
            options: [],
            parsedDataGenerated: false,
            rawAssetsImported: false,
            rootAssetsPath: ``,
            selectedOption: ``,
        }
    }

    /**
     * Helper method to set cache-linked state values based on the current values in the cache
     * 
     * @returns Object containing values for cache-linked state values
     */
    async generateCacheLinkedStateValues() {
        const rootAssetsPath = await CACHE.getRootAssetsPath()
        const rawAssetsData = await CACHE.getRawDataFromCache()
        const parsedData = await CACHE.getParsedDataFromCache()
        return {
            rootAssetsPath,
            rawAssetsImported: Object.keys(rawAssetsData).length > 0 ? true : false,
            parsedDataGenerated: Object.keys(parsedData).length > 0 ? true : false
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
                label: `View raw data`,
                value: OPTION_VALUE.VIEW_RAW_DATA
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

        // TODO: Add an option for "re-setting" the assets path (this will also need to clear out the cache)
        /**
         * N.B.
         * 
         * We always want to show the SET_ASSETS_DIRECTORY option so that the user
         * can specify a different path if they want to.
         */
        options.push({
            label: `Set assets directory`,
            value: OPTION_VALUE.SET_ASSETS_DIRECTORY
        })

        return options
    }

    /**
     * Helper method to determine what menu options to display
     * 
     * This works by first obtaining the cache-linked state values
     * and setting the state accordingly. We *must* set the
     * options array in a separate setState call - without doing
     * so, the cache-derived values don't show. This is likely
     * some kind of bug OR a quirk of using `ink`, but it's unclear
     * at the time of writing this comment.
     */
    async obtainMenuOptions() {
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
        })
        // TODO: See if we can refactor the options generation logic so that we don't need separate setState calls
        .then(() => {
            // TODO: this seems to work, but see if chaining these state updates in subsequent .then calls is safe
            this.setState(prevState => ({
                ...prevState,
                options: this.stitchOptionsArrays({
                    optionsArr1: prevState.options,
                    optionsArr2: this.deriveMenuOptionsFromCacheValues()
                })
            }))
        })
    } 

    componentDidMount() {
        this.obtainMenuOptions()
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
        this.clearSelectedOptionHandler()
    }

    /**
     * Clears the selected option from the CLIApp state
     * 
     * This method is used to "return" to the main menu from a sub-component. When no
     * option is selected, the main menu displays by default
     */
    clearSelectedOptionHandler = () => this.setState(prevState => ({
        ...this.state,
        options: this.stitchOptionsArrays({
            optionsArr1: prevState.options,
            optionsArr2: this.deriveMenuOptionsFromCacheValues()
        }),
        selectedOption: undefined
    }))

    /**
     * Helper method to decide if the given option already exists in the given options
     * array
     * 
     * @returns     `true`, if the given `option` already exists in the given `options` array, otherwise `false`
     */
    isDuplicateOption(args: { option: MenuOption, options: MenuOption[] }) {
        for(var i = 0; i < args.options.length; i++) {
            if (args.options[i].value === args.option.value) {
                return true
            }
        }
        return false
    }

    /**
     * Stiches together two options array into a single array without any duplicate options
     * 
     * @param args 
     * @returns 
     */
    stitchOptionsArrays = (args: {optionsArr1: MenuOption[], optionsArr2: MenuOption[]}) => {
        const rawOptionsArray = [
            ...args.optionsArr1,
            ...args.optionsArr2
        ]

        // Array with duplicates removed
        const prunedOptionsArray = [] as MenuOption[]

        rawOptionsArray.forEach((option) => {
            if (!this.isDuplicateOption({
                option,
                options: prunedOptionsArray
            })) {
                prunedOptionsArray.push(option)
            }
        })

        return prunedOptionsArray
    }

    /**
     * Menu item select handler
     * 
     * Decides what to do based on the user's collection.
     * 
     * @param option  The option that the user selected
     */
    async menuSelectHandler(option: { label: string, value: OPTION_VALUE }) {
        switch (option.value) {
            /**
             * The bootstrap operation has no associated menu - it's simply an operation that runs
             * on the imported raw assets data
             */
            case OPTION_VALUE.BOOTSTRAP_DATA: {
                await CACHE_CLIENT.parseImportedData()
                break
            }
            default: {
                this.setState({
                    ...this.state,
                    selectedOption: option.value
                })
            }
        }
        this.obtainMenuOptions()
    }

    /**
     * Returns true if the user has a currently-selected Main Menu option
     * 
     * We should use this to control the visibility of the MainMenu component. When an option
     * is selected, we render that option-specific component
     */
    hasSelectedOption = () => (this.state.selectedOption && this.state.selectedOption.length > 0)

    /**
     * Renders a sub-menu/form/page depending on the current selection
     * 
     * This method is responsible for deciding which sub-component to render based
     * on the currently-selected option
     */
    renderSelectedOptionMenu = () => {
        switch(this.state.selectedOption) {
            case OPTION_VALUE.SET_ASSETS_DIRECTORY: {
                return <SetAssetsPathForm 
                            clearSelectedOptionHandler={this.clearSelectedOptionHandler.bind(this)}
                            setRootAssetsPathHandler={this.setRootAssetsPathHandler.bind(this)}
                        />
            }
            case OPTION_VALUE.INSPECT_DATA: {
                return (
                    <>
                    </>
                )
            }
            case OPTION_VALUE.VIEW_PARSED_DATA: {
                return <InspectParsedData clearSelectedOptionHandler={this.clearSelectedOptionHandler.bind(this)}/>
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
                </Layout>
            </>
        )
    }
    
}

render(<CLIApp />)
