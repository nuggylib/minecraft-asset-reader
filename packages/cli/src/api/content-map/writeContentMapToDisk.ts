import express from "express"
import { CACHE } from "../../main"

// TODO: update this to use the database
export function writeContentMapToDisk(
  req: express.Request,
  res: express.Response
) {
  const { path } = req.body

  return CACHE.writeContentMapToDisk({
    path,
  }).then((mutationResult) => {
    res.send(mutationResult)
  })
}
