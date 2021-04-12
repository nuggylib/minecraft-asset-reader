import { useState, useEffect } from "react"
import { CACHE } from "../main"
import { ParsedData, RawAssetData } from "../types"

export const enum OPTION_VALUE {
  SET_ASSETS_DIRECTORY = `set_assets_directory`,
  BOOTSTRAP_DATA = `bootstrap_data`,
  VIEW_RAW_DATA = `view_raw_data`,
  VIEW_PARSED_DATA = `view_parsed_data`,
  EXPORT_PARSED_DATA = `export_parsed_data`,
}

export const useMenuOptions = (props: {
  parsedData?: ParsedData
  rawData?: RawAssetData
  // Will never be null, just empty when unset
  rawAssetsPath: string
}) => {
  const [options, setOptions] = useState(
    [] as { label: string; value: OPTION_VALUE }[]
  )

  useEffect(() => {
    const array = []
    /**
     * N.B.
     *
     * We always want to show the SET_ASSETS_DIRECTORY option so that the user
     * can specify a different path if they want to.
     */
    array.push({
      label: `Set assets directory`,
      value: OPTION_VALUE.SET_ASSETS_DIRECTORY,
    })
    if (!!props.rawAssetsPath) {
      array.push({
        label: `Bootstrap page objects`,
        value: OPTION_VALUE.BOOTSTRAP_DATA,
      })
    }

    // TODO: Enable this when we have a raw data component
    // if (!!props.rawData) {
    //   console.log(`RAW DATA WAS DEFINED: `, props.rawData)
    //   array.push({
    //     label: `View raw data`,
    //     value: OPTION_VALUE.VIEW_RAW_DATA,
    //   })
    // }

    if (!!props.parsedData) {
      array.push(
        {
          label: `View parsed data`,
          value: OPTION_VALUE.VIEW_PARSED_DATA,
        },
        {
          label: `Export parsed data`,
          value: OPTION_VALUE.EXPORT_PARSED_DATA,
        }
      )
    }

    setOptions(array)
  }, [
    // We don't want to re-render any time the underlying object changes; just when this goes from falsy to truthy
    !!props.parsedData,
    !!props.rawData,
    props.rawAssetsPath,
  ])

  return options
}
