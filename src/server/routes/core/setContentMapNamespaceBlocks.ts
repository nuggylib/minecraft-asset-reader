import express from "express"
import { CACHE } from "../../../main"

/**
 * After the user configures their content map and click "Submit", this endpoint is intended to handle
 * the submitted data by creating the content-map in the generated output
 *
 * @param req
 * @param res
 */
export function setContentMapNamespaceBlocks(req: express.Request, res: express.Response) {

  const {
    namespace,
    blocks,
  } = req.body

  return CACHE.updateContentMapBlocksForNamespace({
    namespace,
    blocks,
  }).then((contentMap) => {
    res.send({
      contentMap,
    })
  })
}
