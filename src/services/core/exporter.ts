import mkdirp from "mkdirp"
import { writeFileSync } from "fs"
import { CACHE } from "../../main"
import { SiteData } from "../../types/export"
import { LIGHT_DIRECTION, MinecraftBlockRenderer } from "../minecraft"
import { Int } from "../../types/shared"

const DEFAULT_WRITE_PATH = `./generated/`

export class Exporter {
  /**
   * Write the cached parsed data to the local file system
   *
   * @param args
   */
  async exportParsedDataToLocalFilesystem(args: {
    path?: string
    createSeparatePageFiles?: boolean
  }) {
    const siteData = await CACHE.siteData()
    let baseWritePath = `${DEFAULT_WRITE_PATH}/${new Date().toISOString()}`
    // If the user provided a write path, use that instead of the default write path
    if (args.path) {
      baseWritePath = args.path!
    }
    // Create the data export directory
    await mkdirp(baseWritePath)

    if (!!args.createSeparatePageFiles) {
      this.writePageContentAsSeparateJSONFiles({
        parsedData: siteData,
        baseWritePath,
      })
    } else {
      this.writePageContentAsJSONArrayFiles({
        parsedData: siteData,
        baseWritePath,
      })
    }
    return true
  }

  async exportSiteDataToDisk(args: {
    blockIconScaleSizes: Int[]
    writePath: string
  }) {
    const { writePath, blockIconScaleSizes } = args

    const renderer = new MinecraftBlockRenderer()
    const contentMap = CACHE.contentMap()

    const drawBlockPromises = [] as Promise<void>[]

    Object.keys(contentMap).forEach(namespace => {
           Object.keys(contentMap[namespace].blocks).map(blockKey => {
               drawBlockPromises.push(
                   renderer.drawBlockPageIconsForDifferentScales({
                       namespace,
                       blockKey,
                       blockIconData: contentMap[namespace].blocks[blockKey].iconData,
                        lightDirection: LIGHT_DIRECTION.LEFT,
                        scales: blockIconScaleSizes,
                        writePath,
                   })
               )
           }) 
    })

    await Promise.all(drawBlockPromises)
  }

  private writePageContentAsJSONArrayFiles(args: {
    parsedData: SiteData
    baseWritePath: string
  }) {
    const namespaces = Object.keys(args.parsedData)
    namespaces.forEach((namespace) => {
      const { blockPages, itemPages } = args.parsedData[namespace]

      writeFileSync(
        `${args.baseWritePath}/block-pages.json`,
        JSON.stringify(blockPages)
      )
      writeFileSync(
        `${args.baseWritePath}/item-pages.json`,
        JSON.stringify(itemPages)
      )
    })
  }

  private writePageContentAsSeparateJSONFiles(args: {
    parsedData: SiteData
    baseWritePath: string
  }) {
    const namespaces = Object.keys(args.parsedData)
    namespaces.forEach((namespace) => {
      const { blockPages, itemPages } = args.parsedData[namespace]

      blockPages?.forEach((blockPage) => {
        writeFileSync(
          `${args.baseWritePath}/${blockPage.title}.json`,
          JSON.stringify(blockPage)
        )
      })

      itemPages?.forEach((itemPage) => {
        writeFileSync(
          `${args.baseWritePath}/${itemPage.title}.json`,
          JSON.stringify(itemPage)
        )
      })
    })
  }
}
