import express from "express"
import { CACHE } from "../../../main"

export function writeContentMapToDisk(
  req: express.Request,
  res: express.Response
) {
  const { path } = req.body

  return CACHE.writeContentMapToDisk({
    path,
  }).then((mutationResult) => {
    console.log(`WRITE CONTENT MAP RESULT: `, mutationResult)
    res.send(mutationResult)
  })
}
