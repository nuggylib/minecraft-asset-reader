import express from "express"
import { Dao } from "../../db"

export function getBlocks(req: express.Request, res: express.Response) {
  const { gameVersion, q } = req.query

  if (!gameVersion) {
    res.status(422).send(`'gameVersion' parameter is required`)
  }

  Dao(gameVersion as string).then((db) =>
    db
      .getBlocks({
        search: q as string | undefined,
      })
      .then((result) => res.send(result))
      .catch((e) => res.status(422).status(e))
  )
}
