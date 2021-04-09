import { useState, useEffect } from "react"
import { CACHE } from "../cache/cacheClient"

export const useRawAssetsPath = (props: { watch?: any }) => {
  const [rawAssetsPath, setRawAssetsPath] = useState(
    (null as unknown) as string
  )

  useEffect(() => {
    CACHE.getRootAssetsPath().then((rawAssetsPath) => {
      setRawAssetsPath(rawAssetsPath!)
    })
  }, [props.watch])

  return rawAssetsPath
}
