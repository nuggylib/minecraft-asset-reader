import express from "express"
import { Dao } from "../../db"

export function getImportedGameVersions(
  req: express.Request,
  res: express.Response
) {
  Dao().then((db) =>
    db.getImportedGameVersions().then((result) => res.send(result))
  )
}
