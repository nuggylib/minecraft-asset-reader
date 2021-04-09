import React from "react"
import { useState, useEffect } from "react"
import {
  useMenuOptions,
  useParsedData,
  useRawAssetsPath,
  useRawData,
} from "./hooks"
import { Layout } from "./components/Layout"
import { Box } from "ink"
import { Text } from "ink"
import { CACHE_CLIENT } from "./cache/cacheClient"
import { SetAssetsPathForm } from "./components/SetAssetsPathForm"
import { InspectParsedData } from "./components/InspectParsedData"
import { ExportParsedData } from "./components/ExportParsedData"
import { Menu } from "./components/shared/Menu"

export const enum OPTION_VALUE {
  SET_ASSETS_DIRECTORY = `set_assets_directory`,
  IMPORT_DATA = `import_data`,
  INSPECT_DATA = `inspect_data`,
  BOOTSTRAP_DATA = `bootstrap_data`,
  VIEW_RAW_DATA = `view_raw_data`,
  VIEW_PARSED_DATA = `view_parsed_data`,
  EXPORT_PARSED_DATA = `export_parsed_data`,
}

export const CLIApp = () => {
  const [selectedOption, setSelectedOption] = useState(
    (null as unknown) as string
  )
  let rawAssetsPath = useRawAssetsPath({
    watch: selectedOption,
  })
  let rawData = useRawData({
    watch: selectedOption,
  })
  let parsedData = useParsedData({
    watch: selectedOption,
  })
  // "watch" convention isn't used here since the parameters are also used in business logic, and not *just* for updating (as the others are)
  let options = useMenuOptions({
    rawAssetsPath,
    rawData,
    parsedData,
  })

  const clearSelectedOptionHandler = () =>
    setSelectedOption((null as unknown) as string)
  const renderSelectedOptionMenu = () => {
    switch (selectedOption) {
      case OPTION_VALUE.SET_ASSETS_DIRECTORY: {
        return (
          <SetAssetsPathForm
            clearSelectedOptionHandler={clearSelectedOptionHandler}
          />
        )
      }
      case OPTION_VALUE.INSPECT_DATA: {
        return <></>
      }
      case OPTION_VALUE.VIEW_PARSED_DATA: {
        return (
          <InspectParsedData
            clearSelectedOptionHandler={clearSelectedOptionHandler}
          />
        )
      }
      case OPTION_VALUE.EXPORT_PARSED_DATA: {
        // Return a componet that allows the user to specify whether
        // they want separate block page files or a single JSON file
        return (
          <ExportParsedData
            clearSelectedOptionHandler={clearSelectedOptionHandler}
          />
        )
      }
      default: {
        return <></>
      }
    }
  }
  const menuSelectHandler = (option: { label: string; value: string }) => {
    switch (option.value) {
      /**
       * The bootstrap operation has no associated menu - it's simply an operation that runs
       * on the imported raw assets data
       */
      case OPTION_VALUE.BOOTSTRAP_DATA: {
        // TODO: (BUG) Fix this so that it triggers the menu to update and all options render when they should
        CACHE_CLIENT.parseImportedData()
        break
      }
      default: {
        setSelectedOption(option.value)
      }
    }
  }

  return (
    <>
      <Layout>
        {!!selectedOption ? (
          renderSelectedOptionMenu()
        ) : (
          <Menu
            title={`MENU`}
            options={options}
            onSelectHandler={menuSelectHandler}
          />
        )}
        <Box marginTop={4}>
          <Text color="blue">Session Details</Text>
        </Box>
        <Box marginLeft={1}>
          <Text>
            Assets path:{` `}
            {rawAssetsPath ? rawAssetsPath : `-`}
          </Text>
        </Box>
      </Layout>
    </>
  )
}
