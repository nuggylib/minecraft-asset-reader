import { useState, useEffect } from "react"
import axios from "axios"
import { BlockModelData } from "../minecraft/types"

export const usePaginatedBlocksForNamespace = (props: {
  page: number
  namespace: string
  sortOrder: `ascending` | `descending`
  q: string
}) => {
  const [blockRecords, setBlockRecords] = useState(
    [] as {
      block: string
      data: BlockModelData
    }[]
  )

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/raw-data/blocks?page=${props.page}&namespace=${props.namespace}&order=${props.sortOrder}&q=${props.q}&limit=12`
      )
      .then((res) => {
        const blocks = res.data.items
        setBlockRecords(blocks)
      })
  }, [props.namespace, props.page, props.sortOrder, props.q])

  return blockRecords
}
