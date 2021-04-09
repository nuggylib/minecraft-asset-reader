import { useState, useEffect } from "react"
import { CACHE } from "../cache/cacheClient"
import { RawAssetData } from "../types"

export const useRawData = (props: { watch?: any }) => {
  const [rawData, setRawData] = useState((null as unknown) as RawAssetData)

  useEffect(() => {
    CACHE.getRawDataFromCache().then((rawData) => {
      setRawData(rawData!)
    })
  }, [props.watch])

  return rawData
}
