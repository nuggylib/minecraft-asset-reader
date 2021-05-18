import express from "express"
import { Dao } from "../../../services/db"

export function addNamespace(req: express.Request, res: express.Response) {
  const { key, gameVersion } = req.body

  if (!key) {
    res.status(422).send(`'key' parameter is required`)
  } else {
    Dao(gameVersion)
      .then((db) => db.addNamespace(key))
      .then((result) => {
        res.send(result)
      })
      .catch((e) => res.status(422).status(e))
  }
}
