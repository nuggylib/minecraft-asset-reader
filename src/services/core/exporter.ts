import sanity from "@sanity/client"
import mkdirp from "mkdirp"
import fs from "fs"
import { CACHE } from "../../main"
import { LIGHT_DIRECTION, MinecraftBlockRenderer } from "../minecraft"
import { Int } from "../../types/shared"
import { SanityClient } from "../cms/sanity"
import { BlockIconData } from "../../types/cache"
import { basename } from "path"

/**
 * Internal exporter client
 *
 * Handles exporting data to the various supported locations. At the time of writing this comment,
 * we only support exporting to the local file system, and to Sanity.
 */
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

    Object.keys(contentMap).forEach((namespace) => {
      Object.keys(contentMap[namespace].blocks).map((blockKey) => {
        createBlockPagePromises.push(
          this.generateBlockPage({
            blockTitle: contentMap[namespace].blocks[blockKey].title,
            data: contentMap[namespace].blocks[blockKey],
            writePath: `${writePath}/${exportTime}/${namespace}/blocks`,
          })
        )
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

  async exportSiteDataToSanity(args: {
    blockIconScaleSizes: Int[]
    projectName: string
    authToken: string
  }) {
    const sanityAccountClient = new SanityClient(args.authToken)
    const createProjectResult = await sanityAccountClient.createProject({
      displayName: args.projectName,
    })
    if (!createProjectResult.success) {
      return // TODO: Error handling
    }

    const namespaces = Object.keys(CACHE.contentMap())
  }

  private async exportNamespaceImagesToSanity(args: {
    projectId: string
    authToken: string
    namespace: string
    blockKey: string
    blockIconData: BlockIconData
    lightDirection: LIGHT_DIRECTION
    scales: Int[]
  }) {
    const accountClient = new sanity({
      projectId: args.projectId,
      dataset: `production`,
      token: args.authToken,
    })

    // Generate and upload images
    await Promise.all(
      args.scales.map((scale) => {
        this.renderer
          .drawBlockPageIcon({
            namespace: args.namespace,
            blockKey: args.blockKey,
            blockIconData: args.blockIconData,
            lightDirection: args.lightDirection,
            scale,
          })
          .then((imageFilePath) => {
            accountClient.assets.upload(
              `image`,
              fs.readFileSync(imageFilePath),
              {
                filename: basename(imageFilePath),
              }
            )
          })
          .catch((e) => {
            console.error(
              `Encountered error while uploading image for '${args.blockKey}': `,
              e.message
            )
          })
      })
    )
  }
}
