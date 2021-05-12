import express from "express"
import { Dao } from "../../services/db"

export function getBlocks(req: express.Request, res: express.Response) {
  const { q } = req.query

  Dao().then((db) => {})
}
