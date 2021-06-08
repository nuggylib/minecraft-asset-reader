import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { readFileSync } from "fs"
import { CACHE } from "../main"
// import mkdirp from "mkdirp"
import { ItemIconData } from "../types/cache"
import { Int } from "../types/shared"

// TODO: Test the impact of the different values
/**
 * Supported context pattern qualities when drawing the image
 * from the context.
 */
export enum ITEM_CONTEXT_PATTERN_QUALITY {
  BEST = `best`,
  BILINEAR = `bilinear`,
  FAST = `fast`,
  GOOD = `good`,
  NEAREST = `nearest`,
}

const SIZE = 16

/**
 * @see https://www.npmjs.com/package/minecraft-blocks-render
 * @see https://www.npmjs.com/package/canvas
 */
export class MinecraftItemRenderer {
  async drawItemPageIconsForDifferentScales(args: {
    namespace: string
    itemKey: string
    itemIconData: ItemIconData
    scales: Int[]
    writePath: string
  }) {
    await Promise.all(
      args.scales.map((scale) => {
        this.drawItemPageIcon({
          namespace: args.namespace,
          itemKey: args.itemKey,
          itemIconData: args.itemIconData,
          writePath: args.writePath,
          scale,
        })
      })
    )
  }

  /**
   * Draws the isometric view of a item model for a given item
   *
   * Uses the `canvas` module to draw a new image asset, converts
   * it to `base64`, then sets it as the item's `icon`
   */
  async drawItemPageIcon(args: {
    namespace: string
    itemKey: string
    itemIconData: ItemIconData
    scale?: Int
    writePath?: string
  }): Promise<Buffer> {
    const canvas = createCanvas(32, 32)
    const context = canvas.getContext(`2d`)
    // The texture names (not the actual textures, yet)
    const { main } = args.itemIconData
    const { scale, namespace } = args

    let scaleValue = 16
    if (!!scale) {
      scaleValue = scale
    }

    const rawAssetsPath = await CACHE.getRootAssetsPath()

    const mainFullPath = `${rawAssetsPath}/${namespace}/textures${
      main.includes(`/items`) ? main : `/items/${main}`
    }.png`

    const mainBuf = readFileSync(mainFullPath)

    const mainPart = this.scale({
      sourceImage: await loadImage(mainBuf, scale),
      scale: scaleValue,
      patternQuality: ITEM_CONTEXT_PATTERN_QUALITY.FAST,
    })

    // This logic is largely borrowed from https://www.npmjs.com/package/minecraft-blocks-render
    // Calculate dimensions for the canvas that will be used
    const isoWidth = 0.5
    const skew = isoWidth * 2
    const z = (scaleValue * SIZE) / 2
    const sideHeight = mainPart.height * 1.2

    // Start drawing
    context.setTransform(1, -isoWidth, 1, isoWidth, 0, 0)
    context.drawImage(
      mainPart,
      -z - 1,
      z,
      mainPart.width,
      mainPart.height + 1.5
    )

    // const stream = canvas.createPNGStream()
    // stream.pipe(out)
    // out.on(`finish`, () => {
    // console.log(`Saved icon for block ${args.blockKey}`)
    // })
    // Seems we don't need to return this afterall (need to use the onFinish callback)
    const iconBuffer = canvas.toBuffer()
    return iconBuffer
  }

  /**
   * Scales the given image by the specified amount using the specified pattern quality
   *
   * @param sourceImage
   * @param scale
   * @param disableSmoothing  Optional argument to disable smoothing on client-side canvas
   * @return
   */
  scale({
    sourceImage,
    scale,
    patternQuality = ITEM_CONTEXT_PATTERN_QUALITY.FAST,
    disableSmoothing = false,
  }: {
    sourceImage: Image
    scale: number
    patternQuality: ITEM_CONTEXT_PATTERN_QUALITY
    disableSmoothing?: boolean
  }): Canvas {
    let scaleCanvas = createCanvas(32, 32)
    let scaleContext = scaleCanvas.getContext(`2d`)

    const scaledWidth = scale * sourceImage.width
    const scaledHeight = scale * sourceImage.height

    scaleCanvas.width = scaledWidth
    scaleCanvas.height = scaledHeight
    if (!!disableSmoothing) {
      scaleContext.imageSmoothingEnabled = false
    }
    scaleContext.patternQuality = patternQuality
    scaleContext.drawImage(sourceImage, 0, 0, scaledWidth, scaledHeight)
    return scaleCanvas
  }
}
