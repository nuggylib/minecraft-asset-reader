import { useState, useEffect } from "react"
import { RawAssetData } from "../../types/cache"
import { checkForJar } from "../../utils"

export const enum OPTION_VALUE {
  SET_ASSETS_DIRECTORY = `set_assets_directory`,
  BOOTSTRAP_DATA = `bootstrap_data`,
  VIEW_RAW_DATA = `view_raw_data`,
  VIEW_PARSED_DATA = `view_parsed_data`,
  EXPORT_PARSED_DATA = `export_parsed_data`,
  GENERATE_SITE_DATA = `generate_site_data`,
  USE_DEFAULT_ASSETS_DIRECTORY = `use_default_assets_directory`,
}

export const useMenuOptions = (props: {
  rawData?: RawAssetData
  rawAssetsPath: string
}) => {
  const [options, setOptions] = useState(
    [] as { label: string; value: OPTION_VALUE }[]
  )
  const jarExists = checkForJar()
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
    // Only add the option to use the default directory if the jar exists
    if (jarExists) {
      array.push({
        label: `Use default assets directory`,
        value: OPTION_VALUE.USE_DEFAULT_ASSETS_DIRECTORY,
      })
    }
    setOptions(array)
  }, [!!props.rawData, props.rawAssetsPath])

  return options
}
