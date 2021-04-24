import express from "express"
import { Exporter } from "../../services/core/exporter"

export async function writeSiteDataToDisk(req: express.Request, res: express.Response) {
    const {
        writePath,
        blockIconScaleSizes,
    } = req.body

    if (!writePath) {
        res.send({
            error: `Write path must be specified`,
        })
    }

    const exporter = new Exporter()

    try {
        await exporter.exportSiteDataToDisk({
            blockIconScaleSizes,
            writePath,
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
