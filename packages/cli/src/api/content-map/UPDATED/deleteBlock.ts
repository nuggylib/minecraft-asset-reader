import express from "express"
import { Dao } from "../../../services/db"

export function deleteBlock(req: express.Request, res: express.Response) {
  const { gameVersion, key } = req.query

  if (!key || !gameVersion) {
    res.status(422).send(`'key' and 'gameVersion' parameters are required`)
  }

  Dao(gameVersion as string).then((db) =>
    db
      .deleteBlock({
        key: key as string,
      })
      .then((result) => res.send(result))
  )
}
