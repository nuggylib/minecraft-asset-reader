import express from "express"
import { CACHE } from "../../main"
import paginate from "express-paginate"
import { BlockModelData } from "../../minecraft/types"

/**
 * Returns a form in a browser tab for the user to interact with in an easier fashion than using the CLI,
 * which can get a bit cumbersome when there is a lot of data to go through.
 *
 * @param req
 * @param res
 */
export function getBlocksForNamespace(
  req: express.Request,
  res: express.Response
) {
  // If limit is unset, it defaults to 10
  const { namespace, limit, skip, page } = req.query
  // Need to remove the quotation marks from the namespace, otherwise it will not work
  const name = namespace ? namespace.toString().replace(/['"]+/g, ``) : ``
  const startIndex = skip ? skip : 0

  const rawData = CACHE.getRawData()
  const records = [] as {
    block: string
    data: BlockModelData
  }[]
  const blocksForNamespace = rawData[name].model.block
  const blockNames = Object.keys(blocksForNamespace)
  const pageCount = Math.ceil(
    blockNames.length / ((limit as unknown) as number)
  )
  let pageNum = 1
  if (!!page) {
    pageNum = parseInt((page as unknown) as string)
  }
  const limitNum = parseInt((limit as unknown) as string)
  const paginatedBlockNames = blockNames.slice(
    pageNum * limitNum - limitNum,
    pageNum * limitNum
  )
  paginatedBlockNames.forEach((blockName) => {
    records.push({
      block: blockName,
      data: blocksForNamespace[blockName],
    })
  })
  const response = {
    start: startIndex,
    limit: (limit as unknown) as number,
    items: records,
    // Returns previous, current, and next page info (links to each endpoint, use this for "next"/"prev" buttons)
    pages: paginate.getArrayPages(req)(
      3,
      pageCount,
      (page as unknown) as number
    ),
    total_pages: pageCount,
    has_more: paginate.hasNextPages(req)(pageCount),
  }
  res.send(response)
}
