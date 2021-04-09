import React from "react"
import { useState, useEffect } from "react"
import { CACHE } from "../cache/cacheClient"
import { ParsedData, BlockPage } from "../types"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import { useParsedData } from "../hooks"
import { NamespaceParsedBlockData } from "./NamespaceParsedBlockDataData"

export const InspectParsedData = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  const [input, setInput] = useState(``)
  const parsedData = useParsedData({})

  const submitHandler = (value: string) => {
    if (value === `q`) {
      props.clearSelectedOptionHandler()
    }
  }

  const parsedDataNamespaces = Object.keys(parsedData) || []
  return (
    <>
      {parsedDataNamespaces.length > 0 ? (
        parsedDataNamespaces.map((namespace) => (
          <Box key={namespace} flexDirection="column">
            <Text color="magentaBright" bold>
              {namespace}
            </Text>
            {parsedData[namespace].blockPages
              ? parsedData[namespace].blockPages!.map((page: BlockPage) => (
                  <NamespaceParsedBlockData blockPage={page} />
                ))
              : null}
          </Box>
        ))
      ) : (
        <Text>NO DATA</Text>
      )}
      <Box>
        <Text>What would you like to do: </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={(value: string) => submitHandler(value)}
          placeholder={`enter command`}
        />
      </Box>
    </>
  )
}
