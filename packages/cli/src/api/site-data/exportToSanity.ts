import express from "express"
import { Exporter } from "../../exporter"

export async function exportToSanity(
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
    console.log(`Exported data to sanity!`)
    res.send({
      sucess: true,
      message: `Export completed successfully`,
    })
  } catch (e) {
    console.error(e)
    res.send({
      success: false,
      message: e.message,
    })
  }
}
