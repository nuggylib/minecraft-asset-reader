import { useState, useEffect } from "react"
import { CACHE } from "../../main"
import { ContentMap } from "../../types"

export const useContentMap = (props: { watch?: any }) => {
  const [contentMap, setContentMap] = useState((null as unknown) as ContentMap)

  useEffect(() => {
    setContentMap(CACHE.getContentMap())
  }, [props.watch])

  return contentMap
}
