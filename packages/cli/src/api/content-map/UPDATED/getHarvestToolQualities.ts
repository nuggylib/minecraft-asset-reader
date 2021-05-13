import express from "express"
import { Dao } from "../../../services/db"

export function getHarvestToolQualities(
  req: express.Request,
  res: express.Response
) {
  Dao().then((db) =>
    db.getHarvestToolQualities().then((result) => res.send(result))
  )
}
