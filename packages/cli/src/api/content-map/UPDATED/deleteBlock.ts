import express from "express"
import { Dao } from "../../../services/db"

export function deleteBlock(req: express.Request, res: express.Response) {
  const { key } = req.query

  if (!key) {
    res.status(422).send(`'key' parameter is required`)
  }

  Dao().then((db) =>
    db
      .deleteBlock({
        key: key as string,
      })
      .then((result) => res.send(result))
  )
}
