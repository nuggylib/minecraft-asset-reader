import express from "express"
import { Exporter } from "../../exporter"

export async function exportToSanity(
  req: express.Request,
  res: express.Response
) {
  const { projectId, authToken, dataset } = req.body

  if (!projectId || !authToken || !dataset) {
    res
      .status(422)
      .send(
        `'projectId', 'dataset' and 'authToken' are all required parameters`
      )
  } else {
    const exporter = new Exporter()

    try {
      await exporter.exportSiteDataToSanity({
        dataset,
        authToken,
        projectId,
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
}
