import React from "react"
import { useParsedData } from "../hooks"
import { useState, useEffect } from "react"
import { Exporter } from "../export/exporter"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"

const enum EXPORT_OPTION_VALUE {
  SAVE_AS_JSON = `save_as_json`,
  SAVE_AS_FILES = `save_as_files`,
}

export const ExportParsedData = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  const parsedData = useParsedData({})
  const [input, setInput] = useState(``)
  const [exportSuccess, setExportSuccess] = useState(false)

  const selectExportDataHandler = (option: string) => {
    switch (option) {
      case EXPORT_OPTION_VALUE.SAVE_AS_FILES: {
        new Exporter()
          .exportParsedDataToLocalFilesystem({
            createSeparatePageFiles: true,
          })
          .then((res) => {
            setExportSuccess(res)
          })
        break
      }
      case EXPORT_OPTION_VALUE.SAVE_AS_JSON: {
        new Exporter().exportParsedDataToLocalFilesystem({}).then((res) => {
          setExportSuccess(res)
        })
        break
      }
      default: {
        return <> </>
      }
    }
  }

  useEffect(() => {}, [exportSuccess])

  // TODO: Refactor so that we use an input menu instead of text input (for more "guard rails" for the user)
  const submitHandler = (value: string) => {
    if (value === `q`) {
      props.clearSelectedOptionHandler()
    } else if (value === `1`) {
      selectExportDataHandler(EXPORT_OPTION_VALUE.SAVE_AS_JSON)
    } else if (value === `2`) {
      selectExportDataHandler(EXPORT_OPTION_VALUE.SAVE_AS_FILES)
    }
  }

  const parsedDataNamespaces = Object.keys(parsedData)

  return (
    <>
      {parsedDataNamespaces.length > 0 ? (
        <Box flexDirection="column">
          <Text>How would you like to export? Enter 1 or 2: </Text>
          <Text>1. Save data as JSON</Text>
          <Text>2. Save data as separate files</Text>

          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={(value: string) => submitHandler(value)}
            placeholder={`Enter option: `}
          />
        </Box>
      ) : (
        <Text>NO DATA</Text>
      )}
      <Text>Data export complete: {!!exportSuccess ? `true` : `false`}</Text>
    </>
  )
}
