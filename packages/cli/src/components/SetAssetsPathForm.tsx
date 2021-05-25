import React from "react"
import { useState } from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import { MinecraftUtility } from "../minecraft/minecraftUtility"
import { Dao } from "../db"

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
    if (value !== `q` && isValid) {
      const parts = value.split(`/`)
      // Assumes the parent directory name to the assets directory is the game version name (as is the case with base Minecraft game files)
      const gameVersion = parts[parts.length - 2]
      /**
       * Once we know the path is valid, we create a game version-specific SQLite database
       * to store the configured content (NOT the raw content; that's always just cached).
       */
      Dao(gameVersion!)
        .then((db) => db.initGameVersionDatabase())
        .then((_initDbResult) => Dao())
        .then((db) => db.addImportedGameVersion(gameVersion))
        .then(() => {
          minecraftAssetReader.readInRawData({
            path: value,
          })
          props.clearSelectedOptionHandler()
        })
    } else if (value === `q`) {
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
