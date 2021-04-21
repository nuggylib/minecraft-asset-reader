import React from "react"
import { useSiteData } from "./hooks"
import { useState, useEffect } from "react"
import { Exporter } from "../export/exporter"
import { Text } from "ink"
import { Menu } from "./shared/Menu"

const enum EXPORT_OPTION_VALUE {
  SAVE_AS_BULK_FILES = `save_as_bulk_files`,
  SAVE_AS_SEPARATE_FILES = `save_as_separate_files`,
  EXIT = `exit`,
}

const MENU_OPTIONS = [
  {
    label: `Save as bulk content files`,
    value: EXPORT_OPTION_VALUE.SAVE_AS_BULK_FILES,
  },
  {
    label: `Save as separate content files`,
    value: EXPORT_OPTION_VALUE.SAVE_AS_SEPARATE_FILES,
  },
  {
    label: `Exit`,
    value: EXPORT_OPTION_VALUE.EXIT,
  },
]

export const ExportParsedData = (props: {
  clearSelectedOptionHandler: () => void
}) => {
  const siteData = useSiteData({})
  const [exportSuccess, setExportSuccess] = useState(false)

  const selectExportDataHandler = (option: {
    label: string
    value: string
  }) => {
    switch (option.value) {
      case EXPORT_OPTION_VALUE.SAVE_AS_SEPARATE_FILES: {
        new Exporter()
          .exportParsedDataToLocalFilesystem({
            createSeparatePageFiles: true,
          })
          .then((res) => {
            setExportSuccess(res)
          })
        break
      }
      case EXPORT_OPTION_VALUE.SAVE_AS_BULK_FILES: {
        new Exporter().exportParsedDataToLocalFilesystem({}).then((res) => {
          setExportSuccess(res)
        })
        break
      }
      case EXPORT_OPTION_VALUE.EXIT: {
        props.clearSelectedOptionHandler()
        break
      }
      default: {
        return <> </>
      }
    }
  }

  useEffect(() => {}, [exportSuccess])

  const parsedDataNamespaces = siteData ? Object.keys(siteData) : []

  return (
    <>
      {parsedDataNamespaces.length > 0 ? (
        <Menu
          title={`How would you like to export?`}
          options={MENU_OPTIONS}
          onSelectHandler={selectExportDataHandler}
        />
      ) : (
        <Text>NO DATA</Text>
      )}
      <Text>Data export complete: {!!exportSuccess ? `true` : `false`}</Text>
    </>
  )
}
