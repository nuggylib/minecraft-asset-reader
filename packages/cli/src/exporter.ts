import sanity, { SanityClient } from "@sanity/client"
// import mkdirp from "mkdirp"
// import fs from "fs"
import { CACHE } from "./main"
import { CONTEXT_PATTERN_QUALITY, MinecraftBlockRenderer } from "./minecraft"
import { Int } from "./types/shared"
import { SanityRESTClient } from "./cms/sanityRestClient"
import { Dao } from "./db"
import { loadImage } from "canvas"

/**
 * Internal exporter client
 *
 * Handles exporting data to the various supported locations. At the time of writing this comment,
 * we only support exporting to the local file system, and to Sanity.
 */
export class Exporter {
  renderer = new MinecraftBlockRenderer()

  // TODO: The logic for this method is REALLY old; this probably all needs to be ripped out and replaced (using the DB, as well)
  async exportSiteDataToDisk(_args: {
    blockIconScaleSizes: Int[]
    writePath: string
  }) {
    // const { writePath, blockIconScaleSizes } = args
    // const renderer = new MinecraftBlockRenderer()
    // const contentMap = CACHE.contentMap()
    // const drawBlockPromises = [] as Promise<void>[]
    // const createBlockPagePromises = [] as Promise<void>[]
    // const exportTime = new Date().toISOString()
    // const gameVersion = CACHE.getCachedGameVersion()
    // const namespaces = await (await (await Dao(gameVersion)).getNamespaces())
    // const blocks = []
    // namespaces.forEach(namespaceQueryResult => {
    // })
    // namespaces.forEach((namespace) => {
    //   Object.keys(contentMap[namespace].blocks).map((blockKey) => {
    //     createBlockPagePromises.push(
    //       this.generateBlockPage({
    //         blockTitle: contentMap[namespace].blocks[blockKey].title,
    //         data: contentMap[namespace].blocks[blockKey],
    //         writePath: `${writePath}/${exportTime}/${namespace}/blocks`,
    //       })
    //     )
    //     drawBlockPromises.push(
    //       renderer.drawBlockPageIconsForDifferentScales({
    //         namespace,
    //         blockKey,
    //         blockIconData: contentMap[namespace].blocks[blockKey].iconData,
    //         lightDirection: LIGHT_DIRECTION.LEFT,
    //         scales: blockIconScaleSizes,
    //         writePath: `${writePath}/${exportTime}`,
    //       })
    //     )
    //   })
    // })
    // await Promise.all(drawBlockPromises)
    // await Promise.all(createBlockPagePromises)
  }

  // async generateBlockPage(args: {
  //   blockTitle: string
  //   data: any
  //   writePath: string
  // }) {
  //   await mkdirp(args.writePath)
  //   fs.writeFileSync(
  //     `${args.writePath}/${args.blockTitle}.json`,
  //     JSON.stringify(args.data)
  //   )
  // }

  // TODO: Create the Sanity project BEFORE we get to this logic (so we have the schema in place for data import)
  async exportSiteDataToSanity(args: {
    blockIconScaleSizes: Int[]
    projectName: string
    authToken: string
  }) {
    const sanityAccountClient = new SanityRESTClient(args.authToken)
    const createProjectResult = await sanityAccountClient.createProject({
      displayName: args.projectName,
    })
    if (!createProjectResult.success) {
      return // TODO: Error handling
    }

    const gameVersion = CACHE.getCachedGameVersion()
    const namespaceQueryResults = await (await Dao(gameVersion)).getNamespaces()

    const projectId = createProjectResult.id

    let projectClient = new sanity({
      projectId,
      token: args.authToken,
      apiVersion: `2021-03-25`,
    })
    await projectClient.datasets.create(`production`)

    // Re-init client with the dataset after it's been created
    projectClient = new sanity({
      projectId,
      token: args.authToken,
      dataset: `production`,
      apiVersion: `2021-03-25`,
    })

    await Promise.all(
      namespaceQueryResults.map(async (namespaceQueryResult) => {
        const blocksForNamespace = await (await Dao(gameVersion)).getBlocks({
          namespaceId: namespaceQueryResult.id,
        })

        await Promise.all(
          blocksForNamespace.map(async (blockQueryResult) => {
            const {
              key,
              // title,
              icon,
              // description,
              // flammability_encouragement,
              // flammability,
              // light_level,
              // min_spawn,
              // max_spawn,
              // namespace_id
            } = blockQueryResult.data

            const iconBuffer = Buffer.from(icon, `base64`)
            await this.exportNamespaceImagesToSanity({
              iconImage: iconBuffer,
              blockKey: key,
              scales: args.blockIconScaleSizes,
              projectClient,
            })
          })
        )
      })
    )
  }

  // TODO: Remove the content map and replace with database operations
  private async exportNamespaceImagesToSanity(args: {
    iconImage: Buffer
    blockKey: string
    scales: Int[]
    projectClient: SanityClient
  }) {
    // Generate and upload images
    await Promise.all(
      args.scales.map(async (scale) => {
        const scaledIconImage = this.renderer.scale({
          sourceImage: await loadImage(args.iconImage, scale),
          scale,
          patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
        })
        // TODO: Handle errors (e.g., when the user specifies an image scale that's too large, like 50 - that will error out)
        const _res = await args.projectClient.assets.upload(
          `image`,
          scaledIconImage.toBuffer(),
          {
            filename: `${args.blockKey}_${scale}`,
          }
        )
      })
    )
  }
}
