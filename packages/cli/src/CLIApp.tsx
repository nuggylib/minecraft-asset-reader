import React, { useEffect } from "react"
import { useState } from "react"
import { OPTION_VALUE, useMenuOptions, useRawData } from "./components/hooks"
import { Layout } from "./components/Layout"
import { Box, Text } from "ink"
import { SetAssetsPathForm } from "./components/SetAssetsPathForm"
import { Menu } from "./components/shared/Menu"
import { SetMinecraftVersion } from "./components/SetMinecraftVersion"
import open from "open"

export const CLIApp = () => {
  const [selectedOption, setSelectedOption] = useState(
    (null as unknown) as string
  )
  const [rawAssetsPath, setRawAssetsPath] = useState(``)
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
        return (
          <SetMinecraftVersion
            clearSelectedOptionHandler={clearSelectedOptionHandler}
            setRawAssetsPathHandler={(v) => setRawAssetsPath(v)}
          />
        )
      }
      // This option is only visible when LOCAL is false (e.g., when running the built app, instead of running the CLI and webapp separately)
      case OPTION_VALUE.OPEN_WEBAPP: {
        open(`http://localhost:3000`)
      }
      default: {
        /**
         * N.B.
         *
         * De-selecting menu options that rendered no additional content to the CLIApp
         *
         * For example - refer to OPEN_WEBAPP. When this option is selected, we simply open a tab to the locally-hosted webapp. No changes are made to the
         * rendered CLIApp component - it simply opens a tab. After the tab is opened, we utilize switch fall-through logic so that, for OPEN_WEBAPP (or
         * any other option we add later that doesn't modify the rendered content of CLIApp), subsequent menu selections are always made from a fresh state,
         * where the previous selection has been cleared from the state.
         *
         * Tl;dr - if adding a menu option that doesn't modify the rendered content of CLIApp, DON'T return in the switch case - simply run the side effect
         * logic and let it fall through to the default case.
         */
        if (selectedOption !== null) clearSelectedOptionHandler()
        return <></>
      }
    }
  }
  const menuSelectHandler = (option: { label: string; value: string }) => {
    // TODO: See about removing this - we probably don't need it anymore now that we rely on the webapp for most user interactions
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
