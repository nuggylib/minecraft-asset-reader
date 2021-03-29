import { createCanvas, Image, loadImage } from "canvas"
import { readFileSync, createWriteStream } from "fs"
import { CACHE } from "../main"
import { BlockIconData, BlockPage } from "../types"
import mkdirp from "mkdirp"

// TODO: Test the impact of the different values
/**
 * Supported context pattern qualities when drawing the image
 * from the context.
 */
enum CONTEXT_PATTERN_QUALITY {
  BEST = `best`,
  BILINEAR = `bilinear`,
  FAST = `fast`,
  GOOD = `good`,
  NEAREST = `nearest`,
}

export enum LIGHT_DIRECTION {
  LEFT = `LEFT`,
  RIGHT = `RIGHT`,
}

// TODO: remove this - it's only for testing
const EXPERIMENTAL_SCALE = 42

// TODO: wtf is this
const SIZE = 16

/**
 * @see https://www.npmjs.com/package/minecraft-blocks-render
 * @see https://www.npmjs.com/package/canvas
 */
export class MinecraftBlockRenderer {
  date

  constructor() {
    this.date = new Date().toISOString()
  }

  /**
   * Draws the isometric view of a block model for a given block
   *
   * Uses the `canvas` module to draw a new image asset, converts
   * it to `base64`, then sets it as the block's `icon`
   */
  async drawBlockPageIcon(args: {
    namespace: string
    blockKey: string
    blockIconData: BlockIconData
    lightDirection: LIGHT_DIRECTION
  }): Promise<string> {
    const canvas = createCanvas(32, 32)
    const context = canvas.getContext(`2d`)
    // The texture names (not the actual textures, yet)
    const { top, sideL, sideR } = args.blockIconData

    const rawAssetsPath = await CACHE.getRootAssetsPath()

    const topFullPath = `${rawAssetsPath}/${args.namespace}/textures/${top}.png`
    const sideLFullPath = `${rawAssetsPath}/${args.namespace}/textures/${sideL}.png`
    const sideRFullPath = `${rawAssetsPath}/${args.namespace}/textures/${sideR}.png`

    const topBuf = readFileSync(topFullPath)
    const sideLBuf = readFileSync(sideLFullPath)
    const sideRBuf = readFileSync(sideRFullPath)

    const topPart = this.scale({
      sourceImage: await loadImage(topBuf, EXPERIMENTAL_SCALE),
      scale: EXPERIMENTAL_SCALE,
      patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
    })

    const sideLPart = this.scale({
      sourceImage: await loadImage(sideLBuf, EXPERIMENTAL_SCALE),
      scale: EXPERIMENTAL_SCALE,
      patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
    })

    const sideRPart = this.scale({
      sourceImage: await loadImage(sideRBuf, EXPERIMENTAL_SCALE),
      scale: EXPERIMENTAL_SCALE,
      patternQuality: CONTEXT_PATTERN_QUALITY.FAST,
    })

    // This logic is largely borrowed from https://www.npmjs.com/package/minecraft-blocks-render
    // Calculate dimensions for the canvas that will be used
    const isoWidth = 0.5
    const skew = isoWidth * 2
    const z = (EXPERIMENTAL_SCALE * SIZE) / 2
    const sideHeight = topPart.height * 1.2

    // Setup the canvas to get ready to draw
    canvas.width = topPart.width * 2
    canvas.height = topPart.height + sideRPart.height * 1.2

    // Start drawing
    // Draw top
    context.setTransform(1, -isoWidth, 1, isoWidth, 0, 0)
    context.drawImage(topPart, -z - 1, z, topPart.width, topPart.height + 1.5)

    // Draw right
    var _x = SIZE * EXPERIMENTAL_SCALE
    context.setTransform(1, -isoWidth, 0, skew, 0, isoWidth)
    context.drawImage(sideRPart, _x, _x + z, sideRPart.width, sideHeight)

    // Draw left
    context.setTransform(1, isoWidth, 0, skew, 0, 0)
    context.drawImage(sideLPart, 0, z, sideLPart.width, sideHeight)

    const baseWritePath = `./generated/${this.date}/icons/blocks`
    await mkdirp(baseWritePath)
    const out = createWriteStream(`${baseWritePath}/${args.blockKey}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on(`finish`, () => {
      console.log(`Saved icon for block ${args.blockKey}`)
    })

    return canvas.toBuffer().toString(`base64`)
  }

  /**
   * Scales the given image by the specified amount using the specified pattern quality
   *
   * @param sourceImage
   * @param scale
   * @param disableSmoothing  Optional argument to disable smoothing on client-side canvas
   * @return
   */
  private scale({
    sourceImage,
    scale,
    patternQuality,
    disableSmoothing = false,
  }: {
    sourceImage: Image
    scale: number
    patternQuality: CONTEXT_PATTERN_QUALITY
    disableSmoothing?: boolean
  }) {
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
