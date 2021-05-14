import express from "express"
import { Dao } from "../../../services/db"

export function getNamespacesFromDb(
  req: express.Request,
  res: express.Response
) {
  const { gameVersion } = req.query
  Dao(gameVersion as string).then((db) =>
    db
      .getNamespaces()
      .then((result) => res.send(result))
      .catch((e) => res.status(422).status(e))
  )
}
