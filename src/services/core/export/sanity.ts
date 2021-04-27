import { CACHE } from "../../../main"
import { SanityClient } from "../../cms/sanity"
import sanity from "@sanity/client"
import { BlockIconData } from "../../../types/cache"
import { LIGHT_DIRECTION, MinecraftBlockRenderer } from "../../minecraft"
import { Int } from "../../../types/shared"
import fs from "fs"
import { basename } from "path"
import { SanityMutation } from "../../../types/sanity"

export class SanityExporter {
  authToken: string
  renderer

  constructor(authToken: string) {
    this.authToken = authToken
    this.renderer = new MinecraftBlockRenderer()
  }

  async createNewSanityProject(args: { projectName: string }) {
    const sanityAccountClient = new SanityClient(this.authToken)
    const createProjectResult = await sanityAccountClient.createProject({
      displayName: args.projectName,
    })
    if (!createProjectResult.success) {
      return // TODO: Error handling
    }

    const contentMap = CACHE.contentMap()
    const namespaces = Object.keys(contentMap)

    await Promise.all(
      namespaces.map((namespace) => {
        // Create documents
        // Create assets
      })
    )
  }

  /**
   *
   * @param args
   */
  async createOrUpdateBlockPagesForProjectNamespace(args: {
    projectId: string
    namespace: string
    dataset: string
  }) {
    const contentMap = CACHE.contentMap()
    const blocks = contentMap[args.namespace].blocks
    const mutations = [] as SanityMutation[]
    Object.keys(blocks).map((blockKey) => {
      mutations.push({
        create: {
          _id: blockKey,
          _type: `minecraft.block`,
          title: contentMap[args.namespace].blocks[blockKey].title,
          description: ``,
        },
      })
    })

    const client = new SanityClient(this.authToken, args.projectId)
    await client.mutationTransaction({
      mutations,
    })
  }

  async createBlockDocumentAndAssets(args: {
    projectId: string
    namespace: string
    dataset: string
    blockKey: string
    blockIconData: BlockIconData
    lightDirection: LIGHT_DIRECTION
    scales: Int[]
  }) {
    const accountClient = new sanity({
      projectId: args.projectId,
      dataset: `production`,
      token: this.authToken,
    })

    // TODO: Create the block document

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
