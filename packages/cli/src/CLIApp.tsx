import React from "react"
import { useState } from "react"
import {
  OPTION_VALUE,
  useMenuOptions,
  useRawAssetsPath,
  useRawData,
} from "./services/core/components/hooks"
import { Layout } from "./services/core/components/Layout"
import { Box } from "ink"
import { Text } from "ink"
import { SetAssetsPathForm } from "./services/core/components/SetAssetsPathForm"
import { Menu } from "./services/core/components/shared/Menu"
import { checkForAssets } from "./utils"
import { CACHE } from "./main"

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
  // "watch" convention isn't used here since the parameters are also used in business logic, and not *just* for updating (as the others are)
  let options = useMenuOptions({
    rawAssetsPath,
    rawData,
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
      case OPTION_VALUE.USE_DEFAULT_ASSETS_DIRECTORY: {
        CACHE.setRootAssetsPath(checkForAssets())
        // checkForAssets()
        // clearSelectedOptionHandler()
        console.log(selectedOption)
        // setSelectedOption(`foo`)
      }
      default: {
        return <></>
      }
    }
  }
  const menuSelectHandler = (option: { label: string; value: string }) => {
    // TODO: See about removing this - we probably don't need it anymore now that we rely on the webapp for most user interactions
    // switch (option.value) {

    // }
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
