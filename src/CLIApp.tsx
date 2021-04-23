import React from "react"
import { useState } from "react"
import {
  OPTION_VALUE,
  useMenuOptions,
  useSiteData,
  useRawAssetsPath,
  useRawData,
} from "./services/core/components/hooks"
import { Layout } from "./services/core/components/Layout"
import { Box } from "ink"
import { Text } from "ink"
import { SetAssetsPathForm } from "./services/core/components/SetAssetsPathForm"
import { InspectParsedData } from "./services/core/components/InspectParsedData"
import { ExportParsedData } from "./services/core/components/ExportParsedData"
import { Menu } from "./services/core/components/shared/Menu"
import { useContentMap } from "./services/core/components/hooks/useContentMap"
// import { CACHE } from "./main"
import { MinecraftUtility } from "./services/minecraft/minecraftUtility"

export const CLIApp = () => {
  const minecraftUtil = new MinecraftUtility()
  const [selectedOption, setSelectedOption] = useState(
    (null as unknown) as string
  )
  let rawAssetsPath = useRawAssetsPath({
    watch: selectedOption,
  })
  let rawData = useRawData({
    watch: selectedOption,
  })
  let parsedData = useSiteData({
    watch: selectedOption,
  })
  let contentMap = useContentMap({
    watch: selectedOption,
  })
  // "watch" convention isn't used here since the parameters are also used in business logic, and not *just* for updating (as the others are)
  let options = useMenuOptions({
    rawAssetsPath,
    rawData,
    contentMap,
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
        minecraftUtil
          .bootstrapSiteData()
          // De-select the selected option once the parse is complete
          .then(() => setSelectedOption((null as unknown) as string))
        break
      }
      // case OPTION_VALUE.GENERATE_SITE_DATA: {
      //   CACHE.generateSiteContent().then(() =>
      //     setSelectedOption((null as unknown) as string)
      //   )
      // }
    }
    // Always set the selected option, even if there is no GUI to render for the option
    setSelectedOption(option.value)
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
