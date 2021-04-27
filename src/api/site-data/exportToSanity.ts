import express from "express"
import { Exporter } from "../../services/core/exporter"

export async function writeSiteDataToDisk(
  req: express.Request,
  res: express.Response
) {
  const { projectName, authToken, blockIconScaleSizes } = req.body

  const exporter = new Exporter()

  try {
    await exporter.exportSiteDataToSanity({
      blockIconScaleSizes,
      projectName,
      authToken,
    })
    res.send({
      sucess: true,
      message: `Export completed successfully`,
    })
  } catch (e) {
    res.send({
      success: false,
      message: e.message,
    })
  }
}
