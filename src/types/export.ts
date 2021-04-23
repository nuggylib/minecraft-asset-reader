/**
 * Represents the fields expected on an arbitrary Block model when
 * added to a CMS
 */
 export type BlockPage = {
    /**
     * The title of the page, which is also the name of the block
     */
    title: string
    /**
     * Description of this block (set by the user in a CMS, ideally)
     */
    description?: string
    /**
     * The image to upload as the block pages main image (base64 string)
     */
    icon?: string
  }
  
  /**
   * Represents the fields expected on an arbitrary Item model when
   * added to a CMS
   */
  export type ItemPage = {
    /**
     * The title of the page, which is also the name of the item
     */
    title: string
    /**
     * The image to upload as the item pages main image
     */
    icon?: Buffer
    /**
     * A list of model file names that this item uses
     */
    models: string[]
    /**
     * Description of this item (set by the user in a CMS, ideally)
     */
    description?: string
    /**
     * A list of texture files that this item uses
     */
    textures: Buffer[]
  }
  
  export type ParsedNamespaceData = {
    blockPages?: BlockPage[]
    itemPages?: ItemPage[]
  }
  
  /**
   * Type definition for how the end data will look (in-memory) for the imported
   * data after it's been formatted to be used as site data.
   */
  export type SiteData = {
    [namespace: string]: ParsedNamespaceData
  }
  