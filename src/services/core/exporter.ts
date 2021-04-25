import mkdirp from "mkdirp"
import fs from "fs"
import { CACHE } from "../../main"
import { LIGHT_DIRECTION, MinecraftBlockRenderer } from "../minecraft"
import { Int } from "../../types/shared"

export class Exporter {

  async exportSiteDataToDisk(args: {
    blockIconScaleSizes: Int[]
    writePath: string
  }) {
    const { writePath, blockIconScaleSizes } = args

    const renderer = new MinecraftBlockRenderer()
    const contentMap = CACHE.contentMap()

    const drawBlockPromises = [] as Promise<void>[]
    const createBlockPagePromises = [] as Promise<void>[]
    const exportTime = new Date().toISOString()

    Object.keys(contentMap).forEach(namespace => {
      Object.keys(contentMap[namespace].blocks).map(blockKey => {
        createBlockPagePromises.push(this.generateBlockPage({
          blockTitle: contentMap[namespace].blocks[blockKey].title,
          data: contentMap[namespace].blocks[blockKey],
          writePath: `${writePath}/${exportTime}/${namespace}/blocks`
        }))
        drawBlockPromises.push(
          renderer.drawBlockPageIconsForDifferentScales({
            namespace,
            blockKey,
            blockIconData: contentMap[namespace].blocks[blockKey].iconData,
            lightDirection: LIGHT_DIRECTION.LEFT,
            scales: blockIconScaleSizes,
            writePath: `${writePath}/${exportTime}`,
          })
        )
      })
    })

    await Promise.all(drawBlockPromises)
    await Promise.all(createBlockPagePromises)
  }

  async generateBlockPage(args: {
    blockTitle: string
    data: any
    writePath: string
  }) {
    await mkdirp(args.writePath)
    fs.writeFileSync(
      `${args.writePath}/${args.blockTitle}.json`,
      JSON.stringify(args.data)
    )
  }
}
