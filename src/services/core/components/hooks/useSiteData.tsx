import { useState, useEffect } from "react"
import { CACHE } from "../../../../main"
import { SiteData } from "../../../../types/export"

export const useSiteData = (props: { watch?: any }) => {
  const [siteData, setSiteData] = useState((null as unknown) as SiteData)

  useEffect(() => {
    setSiteData(CACHE.siteData())
  }, [props.watch])

  return siteData
}
