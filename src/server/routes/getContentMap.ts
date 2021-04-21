import express from "express"
import { CACHE } from "../../main"

export function getContentMap(req: express.Request, res: express.Response) {
  res.send(CACHE.getContentMap())
}
