import { useState, useEffect } from "react"
import { CACHE } from "../cache/cacheClient"
import { ParsedData } from "../types"

export const useParsedData = (props: { watch?: any }) => {
  const [parsedData, setParsedData] = useState({} as ParsedData)

  useEffect(() => {
    CACHE.getParsedDataFromCache().then((parsedData) => {
      setParsedData(parsedData)
    })
  }, [props.watch])

  return parsedData
}
