import express from "express"
import { Dao } from "../../../services/db"

export function addOrUpdateBlock(req: express.Request, res: express.Response) {
  const {
    key,
    gameVersion,
    title,
    icon,
    description,
    flammabilityEncouragementValue,
    flammability,
    lightLevel,
    minSpawn,
    maxSpawn,
  } = req.body

  if (!key || !gameVersion) {
    res.status(422).send(`'key' and 'gameVersion' parameters are required`)
  } else {
    Dao(gameVersion)
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
