type DisplayData = {
  /**
   * Specifies the rotation of the model according to the scheme [x, y, z]
   */
  rotation?: number[]
  /**
   * Specifies the position of the model according to the scheme [x, y, z]. If the value
   * is greater than 80, it is displayed as 80. If the value is less than -80, it is displayed as -80.
   */
  translation?: number[]
  /**
   * Specifies the scale of the model according to the scheme [x, y, z]. If the value is greater than
   * 4, it is displayed as 4.
   */
  scale?: number[]
}

enum CULLFACE_DIRECTION {
  DOWN,
  UP,
  NORTH,
  SOUTH,
  WEST,
  EAST,
}

type ModelFace = {
  /**
   * Defines the area of the texture to use according to the scheme [x1, y1, x2, y2]. If unset, it
   * defaults to values equal to xyz position of the element. The texture behavior is inconsistent
   * if UV extends below 0 or above 16. If the numbers of x1 and x2 are swapped
   * (e.g. from 0, 0, 16, 16 to 16, 0, 0, 16), the texture flips. UV is optional, and if not
   * supplied it automatically generates based on the element's position.
   */
  uv?: number[]
  /**
   * Specifies the texture in form of the texture variable prepended with a #.
   */
  texture: string
  /**
   * Specifies whether a face does not need to be rendered when there is a block touching it in
   * the specified position. The position can be: down, up, north, south, west, or east. It also
   * determines the side of the block to use the light level from for lighting the face, and
   * if unset, defaults to the side.
   */
  cullface?: CULLFACE_DIRECTION
  /**
   * Rotates the texture by the specified number of degrees. Can be 0, 90, 180, or 270.
   * Defaults to 0. Rotation does not affect which part of the texture is used. Instead,
   * it amounts to permutation of the selected texture vertexes (selected implicitly,
   * or explicitly though uv).
   */
  rotation?: number
  /**
   * Determines whether to tint the texture using a hardcoded tint index. The default
   * is not using the tint, and any number causes it to use tint. Note that only
   * certain blocks have a tint index; all others are unaffected.
   */
  tintindex?: any
}

/**
 * Defines an element of a block model definition
 *
 * Blocks can have only cubic forms. If both "parent" and "elements" are set, the "elements" tag
 * overrides the "elements" tag from the previous model.
 */
type ModelElement = {
  /**
   * Start point of a cube according to the scheme [x, y, z]. Values must be between -16 and 32.
   */
  from?: number[]
  /**
   * Stop point of a cube according to the scheme [x, y, z]. Values must be between -16 and 32.
   */
  to?: number[]
  /**
   * Defines the rotation of an element.
   */
  rotation?: {
    /**
     * Sets the center of the rotation according to the scheme [x, y, z].
     */
    origin?: number[]
    /**
     * Specifies the direction of rotation, can be "x", "y" or "z".
     */
    axis?: string
    /**
     * Specifies the angle of rotation. Can be 45 through -45 degrees in 22.5 degree increments.
     */
    angle?: number
    /**
     * Specifies whether or not to scale the faces across the whole block. Can be true or false. Defaults to false.
     */
    rescale?: boolean
  }
  /**
   * Defines if shadows are rendered (true - default), or not (false)
   */
  shade?: boolean
  /**
   * Holds all the faces of the cube. **IMPORTANT: If a face is left out, it does not render.**
   */
  faces: {
    [key: string]: ModelFace
  }
}

/**
 * Defines the shape of the block model JSON file
 *
 * @see https://minecraft.gamepedia.com/Model
 */
export type BlockModelData = {
  /**
   * The parent block to this block
   *
   * This field allows for the creation of dynamic blocks using inheritance
   */
  parent?: string
  /**
   * Whether or not this block responds to to ambient lighting; when unset, this defaults to true
   */
  ambientOcclusion?: boolean
  /**
   * Defines how the block is displayed in a variety of conditions
   */
  display?: {
    thirdperson_righthand?: DisplayData
    thirdperson_lefthand?: DisplayData
    firstperson_righthand?: DisplayData
    firstperson_lefthand?: DisplayData
    gui?: DisplayData
    head?: DisplayData
    ground?: DisplayData
    fixed?: DisplayData
  }
  /**
   * Holds the textures of the model, in form of namespaced ID or can be another texture variable.
   *
   * @see https://minecraft.gamepedia.com/Model#File_path
   */
  textures?: {
    /**
     * Arbitrary set of texture variables; the key names are arbitrary
     */
    [key: string]: string | undefined
    /**
     * What texture to load particles from
     */
    particle?: string
  }
  /**
   * The elements that defines the block's model; not always defined, since model files can inherit from
   * a parent.
   */
  elements?: ModelElement[]
}

type BlockstateVariantData = {
  /**
   * Specifies the path to the model file of the block, in form of namespaced ID.
   */
  model: string
  /**
   * Rotation of the model on the x-axis in increments of 90 degrees.
   */
  x?: number
  /**
   * Rotation of the model on the y-axis in increments of 90 degrees.
   */
  y?: number
  /**
   * Locks the rotation of the texture of a block, if set to true. This way the texture does not rotate
   * with the block when using the x and y-tags above.
   *
   * Defaults to false
   */
  uvlock?: boolean
  /**
   * Sets the probability of the model for being used in the game, defaults to 1 (=100%). If more than
   * one model is used for the same variant, the probability is calculated by dividing the individual
   * model's weight by the sum of the weights of all models. (For example, if three models are used with
   * weights 1, 1, and 2, then their combined weight would be 4 (1+1+2). The probability of each model
   * being used would then be determined by dividing each weight by 4: 1/4, 1/4 and 2/4, or 25%, 25%
   * and 50%, respectively.)
   */
  weight?: number
}

/**
 * Determines a case and the model that should apply in that case.
 */
export type BlockstateMultipartCase = {
  /**
   * Determines the model(s) to apply and its properties. There can be one model or an array of models.
   * If set to an array, the model is chosen randomly from the options given, with each option being
   * specified in separate subsidiary tags.
   */
  apply?: {
    /**
     * Specifies the path to the model file of the block, in form of namespaced ID.
     */
    model?: string
    /**
     * Rotation of the model on the x-axis in increments of 90 degrees.
     */
    x?: number
    /**
     * Rotation of the model on the y-axis in increments of 90 degrees.
     */
    y?: number
    /**
     * Locks the rotation of the texture of a block, if set to true. This way the texture does not
     * rotate with the block when using the x and y-tags above.
     *
     * Defaults to false
     */
    uvlock?: boolean
  }
  /**
   * A list of cases that have to be met for the model to be applied. If unset, the model always applies.
   */
  when?: {
    /**
     * Matches if any of the contained cases return true. Cannot be set alongside other cases.
     */
    OR?: any
    /**
     * Name of a block state. A single case that has to match one of the block states. It can be set
     * to a list separated by | to allow multiple values to match. Cannot be set alongside the OR-tag.
     */
    [state: string]: string | undefined
  }
}

/**
 * @see https://minecraft.gamepedia.com/Model#Block_states
 */
export type BlockBlockstateData = {
  /**
   * Holds the names of all the variants of the block. Each element in this object can either correspond
   * to a single variant data object, or an array of variant data objects
   */
  variants?: {
    [key: string]: BlockstateVariantData
  }
  /**
   * Used instead of variants to combine models based on block state attributes.
   */
  multipart?: BlockstateMultipartCase[]
}

// TODO: Test this type out - there may be issues
/**
 * Item model data
 *
 * As items do not have different variants, there is no need to specify them. The folder
 * assets/<namespace>/models/item contains all the model files. The names of the files
 * are hardcoded and should not be changed.
 *
 * @see https://minecraft.gamepedia.com/Model
 */
export type ItemModelData = {
  /**
   * Loads a different model from the given path, in form of namespaced ID. If both "parent" and
   * "elements" are set, the "elements" tag overrides the "elements" tag from the previous model.
   *
   * Can be set to "item/generated" to use a model that is created out of the specified icon.
   *
   * Can be set to "builtin/entity" to load a model from an entity file. As you cannot specify
   * the entity, this does not work for all items (only for chests, ender chests, mob heads,
   * shields, banners and tridents).
   */
  parent?: string
  /**
   * Holds the different places where item models are displayed.
   */
  display?: {
    thirdperson_righthand?: DisplayData
    thirdperson_lefthand?: DisplayData
    firstperson_righthand?: DisplayData
    firstperson_lefthand?: DisplayData
    gui?: DisplayData
    head?: DisplayData
    ground?: DisplayData
    fixed?: DisplayData
  }
  textures?: {
    /**
     * Arbitrary set of texture variables; the key names are arbitrary
     *
     * Note that this also handles the 'layerN' variables
     */
    [key: string]: string | undefined
    /**
     * What texture to load particles from. Used to determine the "crumb" particles generated by
     * food items, as well as to determine the barrier particle (but it always uses
     * items/barrier.png as blockbreaking particle), which otherwise uses "layer0".
     */
    particle?: string
  }
  /**
   * Can be "front" or "side". If set to "side", the model is rendered like a block. If set to
   * "front", model is shaded like a flat item.
   */
  gui_light?: string
  /**
   * Contains all the elements of the model. They can have only cubic forms. If both "parent" and
   * "elements" are set, the "elements" tag overrides the "elements" tag from the previous model.
   */
  elements?: ModelElement[]
  overrides?: {
    /**
     * Holds the cases.
     */
    predicate?: {
      /**
       * A single case tag. See item predicates for a full list of available tags.
       *
       * Must only contain one element
       *
       * @see https://minecraft.gamepedia.com/Model#Item_predicates
       */
      [key: string]: string | undefined
    }
    /**
     * The path to the model to use if the case is met, in form of namespaced ID.
     */
    model?: string
  }[]
}
