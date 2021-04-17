import express from "express"
import { CACHE } from "../../../main"

export function getBlockFromContentMap(
  req: express.Request,
  res: express.Response
) {
  const { block, namespace } = req.query

  return CACHE.getContentMapFromCache().then((contentMap) => {
    try {
      const configuredBlock =
        contentMap[namespace as string].blocks[block as string]
      res.send(configuredBlock)
    } catch (e) {
      res.send({})
    }
  })
}
