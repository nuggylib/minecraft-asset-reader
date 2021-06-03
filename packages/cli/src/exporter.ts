import sanity, { SanityClient } from "@sanity/client"
// import mkdirp from "mkdirp"
// import fs from "fs"
import { CACHE } from "./main"
import { CONTEXT_PATTERN_QUALITY, MinecraftBlockRenderer } from "./minecraft"
import { Int } from "./types/shared"
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

  async exportSiteDataToSanity(args: {
    dataset: string
    authToken: string
    projectId: string
  }) {
    const { projectId, authToken, dataset } = args

    const gameVersion = CACHE.getCachedGameVersion()
    const namespaceQueryResults = await (await Dao(gameVersion)).getNamespaces()

    // Re-init client with the dataset after it's been created
    const projectClient = new sanity({
      projectId,
      token: authToken,
      dataset,
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
              id,
              key,
              title,
              icon,
              flammability_encouragement,
              flammability,
              light_level,
              min_spawn,
              max_spawn,
              // TODO: Update the Sanity minecraft block schema to support namespace
              // namespace_id
            } = blockQueryResult.data

            const harvestTools = await (
              await Dao(gameVersion)
            ).getHarvestToolsForBlock(id)
            const harvestToolQualities = await (
              await Dao(gameVersion)
            ).getHarvestToolQualitiesForBlock(id)

            const iconBuffer = Buffer.from(icon, `base64`)
            const imageDocument = await this.exportImageToSanity({
              iconImage: iconBuffer,
              blockKey: key,
              // TODO: Test various sizes to see what the largest scale we can use it without making the Sanity API gods angry with us
              scale: 22 as Int,
              projectClient,
            })

            const minecraftBlockDocument = {
              _id: key,
              _type: `minecraftBlock`,
              name: title,
              flammabilityEncouragementValue: flammability_encouragement,
              flammabilityValue: flammability,
              lightLevel: light_level,
              minSpawnLevel: min_spawn,
              maxSpawnLevel: max_spawn,
              harvestTool: harvestTools.map((tool) => tool.data),
              harvestToolMaterial: harvestToolQualities.map(
                (material) => material.data
              ),
            }

            try {
              const createBlockResponse = await projectClient.createOrReplace(
                minecraftBlockDocument
              )
              await projectClient
                .patch(createBlockResponse._id)
                .set({
                  image: {
                    _type: `image`,
                    asset: {
                      _type: `reference`,
                      _ref: imageDocument._id,
                    },
                  },
                })
                .commit()
            } catch (e) {
              console.log(
                `Unable to create block '${key}' - Error: `,
                e.message
              )
            }
          })
        )
      })
    )
  }

  private async exportImageToSanity(args: {
    iconImage: Buffer
    blockKey: string
    scale: Int
    projectClient: SanityClient
  }) {
    // Generate and upload images
    // TODO: Update the UI to only accept one scale size (this is not ideal, but will make linking easier - we can improve this later)
    const { scale } = args
    const scaledIconImage = this.renderer.scale({
      sourceImage: await loadImage(args.iconImage, scale),
      scale,
      patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
    })
    // TODO: Handle errors (e.g., when the user specifies an image scale that's too large, like 50 - that will error out)
    const imageDocument = await args.projectClient.assets.upload(
      `image`,
      scaledIconImage.toBuffer(),
      {
        filename: `${args.blockKey}_${scale}`,
      }
    )

    return imageDocument
  }
}
