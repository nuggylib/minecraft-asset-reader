
export type ProjectMember = {
    id: string
    // TODO: Enumerate the roles
    role: string
}

/**
 * @see https://www.sanity.io/docs/projects-api#8fe6269b8039
 */
export type CreateProjectResponse = {
    isBlocked: boolean
    isDisabled: boolean
    isDisabledByUser: boolean
    metadata: JSON
    maxRetentionDays: number
    dataClass: string
    id: string
    displayName: string
    organizationId: string
    updatedAt: string
    createdAt: string
    studioHost: string
    deletedAt: string
    members: ProjectMember[]
}

/**
 * The Sanity-represenation of a Minecraft block
 * 
 * Sanity uses a document-based approach, where all records
 * are considered documents of differing types. As such, you
 * simply use the same `create` endpoint for any given content
 * type and pass it different fields. These are the fields
 * used when creating the Minecraft block page document.
 */
export type SanityBlockDocument = {
    // TODO: See if colons are permissible in IDs for Sanity documents (will probably just need to test it out)
    /**
     * The internal ID
     * 
     * This will be the "key name" for the block from the config map (e.g. something like
     * `<namespace>:acacia_log`; these are guaranteed to be unique within a namespace)
     */
    _id: string
    /**
     * For this type, will always be `minecraft.block`
     */
    _type: string
    /**
     * The "production-ready" title for the block (e.g., "Acacia Log")
     */
    title: string
    /**
     * Description of the block
     */
    description: string
}

/**
 * @see https://www.sanity.io/docs/http-mutations
 */
export type SanityMutation = {
    [key: string]: JSON
}
