import express from "express"
import { CACHE } from "../../../main"

export function getNamespaces(req: express.Request, res: express.Response) {
  return CACHE.getRawDataFromCache().then((rawData) => {
    res.send({
      items: Object.keys(rawData),
    })
  })
}
