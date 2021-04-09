import React from "react"
import { useState } from "react"
import { CACHE, CACHE_CLIENT } from "../cache/cacheClient"
import { generateRawData, validatesAssetsDirectory } from "../minecraft"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"

export const SetAssetsPathForm = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  const [input, setInput] = useState(``)
  const [isValid, setIsValid] = useState(false)

  const submitHandler = (value: string) => {
    if (value !== `q`) {
      CACHE.setRootAssetsPath(input).then(() => {
        generateRawData({
          path: input,
          setRawDataHandler: CACHE_CLIENT.setRawData,
        })
      })
    }
    props.clearSelectedOptionHandler()
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
      (lastPart === `assets` && validatesAssetsDirectory({ path: input })) ||
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
