import { useState, useEffect } from "react"
import { ContentMap, RawAssetData } from "../../../../types/cache"
import { SiteData } from "../../../../types/export"

export const enum OPTION_VALUE {
  SET_ASSETS_DIRECTORY = `set_assets_directory`,
  BOOTSTRAP_DATA = `bootstrap_data`,
  VIEW_RAW_DATA = `view_raw_data`,
  VIEW_PARSED_DATA = `view_parsed_data`,
  EXPORT_PARSED_DATA = `export_parsed_data`,
  GENERATE_SITE_DATA = `generate_site_data`,
}

export const useMenuOptions = (props: {
  parsedData?: SiteData
  rawData?: RawAssetData
  contentMap?: ContentMap
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

    // TODO: revise the workflow so that this step isn't necessary; all it does is prepare
    if (!!props.rawAssetsPath) {
      array.push({
        label: `Bootstrap page objects`,
        value: OPTION_VALUE.BOOTSTRAP_DATA,
      })
    }

    // TODO: Reuse the old "parse data" logic - that's now the "Site Data" logic and will be used to store the site data
    // The idea is that the content map is _used_ to create the site data; the site data can then be either uploaded to
    // Sanity, or used directly in an SSG (with configurations).
    if (!!props.contentMap) {
      array.push({
        label: `Generate site content`,
        value: OPTION_VALUE.GENERATE_SITE_DATA,
      })
    }

    setOptions(array)
  }, [
    // We don't want to re-render any time the underlying object changes; just when this goes from falsy to truthy
    !!props.parsedData,
    !!props.rawData,
    !!props.contentMap,
    props.rawAssetsPath,
  ])

  return options
}
