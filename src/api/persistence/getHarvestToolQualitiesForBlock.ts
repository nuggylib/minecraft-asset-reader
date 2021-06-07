import express from "express"
import { Dao } from "../../db"
import { Int } from "../../types/shared"

export function getHarvestToolQualitiesForBlock(
  req: express.Request,
  res: express.Response
) {
  const { gameVersion, blockId } = req.query

  if (!gameVersion || !blockId) {
    res
      .status(422)
      .send(`'gameVersion' and 'blockId' parameters are both required`)
  }

  Dao(gameVersion as string).then((db) =>
    db
      .getHarvestToolQualitiesForBlock(parseInt(blockId as string) as Int)
      .then((result) => res.send(result))
      .catch((e) => res.status(422).status(e))
  )
}
