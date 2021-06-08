import express from "express"
import { Dao } from "../../db"

export function deleteItem(req: express.Request, res: express.Response) {
  const { gameVersion, key } = req.query

  if (!key || !gameVersion) {
    res.status(422).send(`'key' and 'gameVersion' parameters are required`)
  }

  Dao(gameVersion as string)
    .then((db) =>
      db
        .deleteItem({
          key: key as string,
        })
        .then((result) => res.send(result))
    )
    .catch((e) => res.status(422).status(e))
}
