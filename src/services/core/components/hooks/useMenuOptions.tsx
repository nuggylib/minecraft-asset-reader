import { useState, useEffect } from "react"
import { RawAssetData } from "../../../../types/cache"

export const enum OPTION_VALUE {
  SET_ASSETS_DIRECTORY = `set_assets_directory`,
  BOOTSTRAP_DATA = `bootstrap_data`,
  VIEW_RAW_DATA = `view_raw_data`,
  VIEW_PARSED_DATA = `view_parsed_data`,
  EXPORT_PARSED_DATA = `export_parsed_data`,
  GENERATE_SITE_DATA = `generate_site_data`,
}

export const useMenuOptions = (props: {
  rawData?: RawAssetData
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

    setOptions(array)
  }, [!!props.rawData, props.rawAssetsPath])

  return options
}
