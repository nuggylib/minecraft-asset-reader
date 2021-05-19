import express from "express"
import { CACHE } from "../../main"

export function getCachedGameVersion(
  req: express.Request,
  res: express.Response
) {
  res.send(CACHE.getCachedGameVersion())
}
