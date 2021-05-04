import express from "express"
import { CACHE } from "../../main"

export function getNamespaces(req: express.Request, res: express.Response) {
  const rawData = CACHE.rawData()
  let namespaces = [] as string[]
  if (!!rawData) {
    namespaces = Object.keys(rawData)
  }
  res.send({
    items: namespaces,
  })
}
