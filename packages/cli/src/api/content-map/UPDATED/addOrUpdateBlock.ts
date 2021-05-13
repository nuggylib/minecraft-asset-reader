import express from "express"
import { Dao } from "../../../services/db"

export function addOrUpdateBlock(req: express.Request, res: express.Response) {
  const {
    key,
    title,
    icon,
    description,
    flammabilityEncouragementValue,
    flammability,
    lightLevel,
    minSpawn,
    maxSpawn,
  } = req.body

  if (!key) {
    res.status(422).send(`'key' parameter is required`)
  } else {
    Dao()
      .then((db) =>
        db.addOrUpdateBlock({
          key,
          title,
          icon,
          description,
          flammabilityEncouragementValue,
          flammability,
          lightLevel,
          minSpawn,
          maxSpawn,
        })
      )
      .then((result) => {
        res.send(result)
      })
  }
}
