import express from "express"
import { Dao } from "../../services/db"
import {
  LIGHT_DIRECTION,
  MinecraftBlockRenderer,
} from "../../services/minecraft"

export async function addOrUpdateBlock(
  req: express.Request,
  res: express.Response
) {
  var {
    key,
    namespace,
    gameVersion,
    title,
    icon,
    // When iconData is provided, the icon will be set/updated using the given texture info
    iconData,
    description,
    flammabilityEncouragementValue,
    flammability,
    lightLevel,
    minSpawn,
    maxSpawn,
    // Harvest tools
    harvestTool,
    harvestToolQualities,
  } = req.body

  if (!key) {
    res.status(422).send(`'key' parameter is required`)
  } else {
    if (!!iconData) {
      const renderer = new MinecraftBlockRenderer()
      const iconBuffer = await renderer.drawBlockPageIcon({
        namespace,
        blockKey: key,
        blockIconData: iconData,
        lightDirection: LIGHT_DIRECTION.LEFT,
      })
      icon = iconBuffer.toString(`base64`)
    }

    Dao(gameVersion)
      .then((db) =>
        db.addOrUpdateBlock({
          key,
          namespace,
          title,
          icon,
          description,
          flammabilityEncouragementValue,
          flammability,
          lightLevel,
          minSpawn,
          maxSpawn,
          // We store these in the DB so that we can pre-populate the drop down selections in the BlockModal - for everything else, use the icon
          iconSideTop: iconData.top,
          iconSideLeft: iconData.sideL,
          iconSideRight: iconData.sideR,
          harvestTool,
          harvestToolQualities,
        })
      )
      .then((result) => {
        res.send(result)
      })
      .catch((e) => res.status(422).status(e))
  }
}
