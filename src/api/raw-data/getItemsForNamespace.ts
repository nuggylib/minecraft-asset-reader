import express from "express"
import paginate from "express-paginate"
import { CACHE } from "../../main"
import { Int } from "../../types/shared"

/**
 * Returns a form in a browser tab for the user to interact with in an easier fashion than using the CLI,
 * which can get a bit cumbersome when there is a lot of data to go through.
 *
 * @param req
 * @param res
 */
export function getItemsForNamespace(
  req: express.Request,
  res: express.Response
) {
  // If limit is unset, it defaults to 10
  const { namespace, limit, page, item, scaleImage, order, q } = req.query
  if (!namespace) {
    res.send({
      error: `You must provide a namespace`,
    })
  }

  /**
   * N.B.
   *
   * When item is unspecified, return a paginated response. Scale image parameter
   * is not yet supported for this logic, but there is no reason it can't be. We
   * intend to implement support later.
   *
   */
  if (!item) {
    const paginatedResponse = CACHE.getPaginatedRawItemsForNamespace({
      namespace: namespace as string,
      limit: !!limit ? (limit as unknown as Int) : undefined,
      page: !!page ? (page as unknown as Int) : undefined,
      order: !!order ? (order as `ascending` | `descending`) : undefined,
      q: !!q ? (q as string) : undefined,
    })
    const response = {
      limit: limit as unknown as number,
      items: paginatedResponse.records,
      // Returns previous, current, and next page info (links to each endpoint, use this for "next"/"prev" buttons)
      pages: paginate.getArrayPages(req)(
        3,
        paginatedResponse.pageCount,
        page as unknown as number
      ),
      total_pages: paginatedResponse.pageCount,
      has_more: paginate.hasNextPages(req)(paginatedResponse.pageCount),
    }
    res.send(response)
  } else {
    // In this case, item was defined; return data about the item
    CACHE.getItemDataWithScaledImages({
      namespace: namespace as unknown as string,
      item: item as unknown as string,
      // Note that, when 1 is used, it will result in a larger image as a side effect of arbitrarily-redrawing the image with canvas
      scaleAmount: !!scaleImage ? (scaleImage as unknown as Int) : 1,
    }).then((itemData) => {
      res.send(itemData)
    })
  }
}
