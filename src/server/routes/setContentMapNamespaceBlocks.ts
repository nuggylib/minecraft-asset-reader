import express from "express"
import { CACHE } from "../../main"

/**
 * After the user configures their content map and click "Submit", this endpoint is intended to handle
 * the submitted data by creating the content-map in the generated output
 *
 * @param req
 * @param res
 */
export function setContentMapNamespaceBlocks(
  req: express.Request,
  res: express.Response
) {
  const { namespace, blocks } = req.body

  if (!namespace || !blocks) {
    res.send({})
  }

  CACHE.updateContentMapBlocksForNamespace({
    namespace,
    blocks,
  })
  res.send(200)
}
