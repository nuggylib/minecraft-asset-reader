import express from "express"
import { Dao } from "../../../services/db"

export function getHarvestTools(req: express.Request, res: express.Response) {
  const { gameVersion } = req.query
  if (!gameVersion) {
    res.status(422).send(`'gameVersion' parameter is required`)
  }
  Dao(gameVersion as string).then((db) =>
    db
      .getHarvestTools()
      .then((result) => res.send(result))
      .catch((e) => res.status(422).status(e))
  )
}
