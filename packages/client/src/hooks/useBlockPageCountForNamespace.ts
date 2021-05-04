import { useEffect, useState } from "react"
import axios from "axios"

export const useBlockPageCountForNamespace = (props: {
  page: number
  namespace: string
  sortOrder: `ascending` | `descending`
  q: string
}) => {
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/raw-data/blocks?page=${props.page}&namespace=${props.namespace}&order=${props.sortOrder}&q=${props.q}&limit=12`
      )
      .then((res) => {
        setPageCount(res.data.total_pages)
      })
  })

  return pageCount
}
