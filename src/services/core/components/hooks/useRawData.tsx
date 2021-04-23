import { useState, useEffect } from "react"
import { CACHE } from "../../../../main"
import { RawAssetData } from "../../../../types/cache"

export const useRawData = (props: { watch?: any }) => {
  const [rawData, setRawData] = useState((null as unknown) as RawAssetData)

  useEffect(() => {
    setRawData(CACHE.rawData())
  }, [props.watch])

  return rawData
}
