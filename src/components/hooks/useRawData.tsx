import { useState, useEffect } from "react"
import { CACHE } from "../../main"
import { RawAssetData } from "../../types"

export const useRawData = (props: { watch?: any }) => {
  const [rawData, setRawData] = useState((null as unknown) as RawAssetData)

  useEffect(() => {
    setRawData(CACHE.getRawData())
  }, [props.watch])

  return rawData
}
