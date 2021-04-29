import sanity from "@sanity/client"
import mkdirp from "mkdirp"
import fs from "fs"
import { CACHE } from "../../main"
import { LIGHT_DIRECTION, MinecraftBlockRenderer } from "../minecraft"
import { Int } from "../../types/shared"
import { SanityRESTClient } from "../cms/sanity"
import { BlockIconData } from "../../types/cache"

/**
 * Internal exporter client
 *
 * Handles exporting data to the various supported locations. At the time of writing this comment,
 * we only support exporting to the local file system, and to Sanity.
 */
export class Exporter {
  renderer = new MinecraftBlockRenderer()
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
    const sanityAccountClient = new SanityRESTClient(args.authToken)
    const createProjectResult = await sanityAccountClient.createProject({
      displayName: args.projectName,
    })
    console.log(`CREATE PROJECT RESULT: `, createProjectResult)
    if (!createProjectResult.success) {
      return // TODO: Error handling
    }

    const contentMap = CACHE.contentMap()
    if (!contentMap) {
      return // TODO: error stuff
    }
    const namespaces = Object.keys(contentMap)
    const projectId = createProjectResult.id

    const createImagePromises = [] as Promise<any>[]

    namespaces.forEach((namespace) => {
      Object.keys(contentMap[namespace].blocks).forEach((blockKey) => {
        createImagePromises.push(
          this.exportNamespaceImagesToSanity({
            projectId,
            authToken: args.authToken,
            namespace,
            blockKey,
            blockIconData: contentMap[namespace].blocks[blockKey].iconData,
            lightDirection: LIGHT_DIRECTION.LEFT,
            scales: args.blockIconScaleSizes,
          })
        )
      })
    })

    await Promise.all(createImagePromises)
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
    let projectClient = new sanity({
      projectId: args.projectId,
      token: args.authToken,
      apiVersion: `2021-03-25`,
    })
    await projectClient.datasets.create(`production`)

    // Re-init client with the dataset after it's been created
    projectClient = new sanity({
      projectId: args.projectId,
      token: args.authToken,
      dataset: `production`,
      apiVersion: `2021-03-25`,
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
          .then((imageBuffer) =>
            projectClient.assets.upload(`image`, imageBuffer, {
              filename: `${args.blockKey}_${scale}`,
            })
          )
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
