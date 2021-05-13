import express from "express"
import { Dao } from "../../../services/db"

export function getHarvestTools(req: express.Request, res: express.Response) {
  Dao().then((db) => db.getHarvestTools().then((result) => res.send(result)))
}
