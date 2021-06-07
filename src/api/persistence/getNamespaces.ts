import express from "express"
import { Dao } from "../../db"

export function getNamespacesFromDb(
  req: express.Request,
  res: express.Response
) {
  const { gameVersion, q } = req.query
  Dao(gameVersion as string).then((db) =>
    db
      .getNamespaces(q as string | undefined)
      .then((result) => res.send(result))
      .catch((e) => res.status(422).status(e))
  )
}
