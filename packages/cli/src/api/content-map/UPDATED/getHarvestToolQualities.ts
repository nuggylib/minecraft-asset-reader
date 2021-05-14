import express from "express"
import { Dao } from "../../../services/db"

export function getHarvestToolQualities(
  req: express.Request,
  res: express.Response
) {
  const { gameVersion } = req.query

  if (!gameVersion) {
    res.status(422).send(`'gameVersion' parameter is required`)
  }

  Dao(gameVersion as string).then((db) =>
    db.getHarvestToolQualities().then((result) => res.send(result))
  )
}
