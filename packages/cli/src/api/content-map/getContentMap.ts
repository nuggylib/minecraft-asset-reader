import express from "express"
import { CACHE } from "../../main"

// TODO: update to use the DB (may actually just be some changes on the front end)
export function getContentMap(req: express.Request, res: express.Response) {
  res.send(CACHE.contentMap())
}
