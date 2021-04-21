import express from "express"
import { CACHE } from "../../main"

export function getScaledAssetsForBlock(
  req: express.Request,
  res: express.Response
) {
  const { namespace, block, scale } = req.query

  return CACHE.getScaledBlockTextures({
    namespace: namespace as string,
    block: block as string,
    scaleAmount: (scale as unknown) as number,
  }).then((scaledTextures) => {
    res.send(scaledTextures)
  })
}
