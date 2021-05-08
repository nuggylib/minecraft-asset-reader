import React from "react"
import { useState } from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import { MinecraftUtility } from "../../minecraft/minecraftUtility"
import { checkForAssets } from "../../../utils"

/**
 * A simple input form to get the base assets path
 *
 * Once the user provides a valid assets path, we call readInRawData, which
 * sets the the raw data in the cache.
 *
 * @param props
 * @returns
 */
export const SetAssetsPathForm = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  const [input, setInput] = useState(``)
  const [isValid, setIsValid] = useState(false)
  const minecraftAssetReader = new MinecraftUtility()

  const submitHandler = (value: string) => {
    if (value === `q`) {
      props.clearSelectedOptionHandler()
    }
    if (value === `default`) {
      minecraftAssetReader.readInRawData({
        path: `beep`, // previously checkForAssets()
      })
      props.clearSelectedOptionHandler()
    } else if (value !== `q` && isValid) {
      minecraftAssetReader.readInRawData({
        path: value,
      })
      props.clearSelectedOptionHandler()
    }
  }

  /**
   * Determines if the given input is valid input or not
   *
   * Valid input includes:
   * 1. `'q'` - to quit the "Set Assets Path" form and go back
   * 2. `'/full/path/to/assets'` - fully-qualified path to the
   *      assets directory (and that the assets directory has the expected contents)
   *
   * @param input
   */
  const setInputHandler = (input: any) => {
    setInput(input)
    var lastPart = input.split(`/`).pop()
    if (
      (lastPart === `assets` &&
        minecraftAssetReader.validatePathAsAssetsDirectory({ path: input })) ||
      input === `q`
    ) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }

  return (
    <>
      <Box marginLeft={1}>
        <Text bold color="blue">
          Import Data
        </Text>
      </Box>
      <Box justifyContent="flex-start" marginLeft={2}>
        <Text>➡️ Enter path to 'assets' directory:</Text>
        {isValid ? <Text> ✔️ </Text> : <Text> ✖️ </Text>}
        <TextInput
          key=""
          value={input}
          onChange={setInputHandler}
          onSubmit={(value: string) => submitHandler(value)}
        />
      </Box>
      <Box marginLeft={1}>
        {!isValid && input.length !== 0 ? (
          <Text color="red">
            The path must end in 'assets' and must contain valid texture packs
            (separated by namespace)
          </Text>
        ) : null}
      </Box>
    </>
  )
}
