import express from "express"
import { Dao } from "../../db"
import { MinecraftBlockRenderer } from "../../minecraft"

export async function addOrUpdateItem(
  req: express.Request,
  res: express.Response
) {
  var {
    key,
    namespace,
    gameVersion,
    title,
    icon,
    max_stack_count,
    edible,
    plantable,
  } = req.body

  if (!key) {
    res.status(422).send(`'key' parameter is required`)
  } else {
    Dao(gameVersion)
      .then((db) =>
        db.addOrUpdateItem({
          key,
          namespace,
          title,
          icon,
          max_stack_count,
          edible,
          plantable,
        })
      )
      .then((result) => {
        res.send(result)
      })
      .catch((e) => res.status(422).status(e))
  }
}
