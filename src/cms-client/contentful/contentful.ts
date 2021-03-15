import fetch from "node-fetch"


const BASE_API_URL = `https://api.contentful.com`

/**
 * The field types for Contentful content models
 * 
 * @see https://www.contentful.com/developers/docs/concepts/data-model/
 */
export enum FIELD_TYPE {
    SYMBOL = "Symbol",
    TEXT = "Text",
    INTEGER = "Integer",
    NUMBER = "Number",
    DATE = "Date",
    LOCATION = "Location",
    BOOLEAN = "Boolean",
    LINK = "Link", // For media and reference types
    ARRAY = "Array",
    OBJECT = "Object",
}

export enum LINK_TYPE {
    ENTRY = `Entry`,
    ASSET = `Asset`
}

// TODO: Find out what other fields there may be - also, find out which are optional
type ContentTypeField = {
    id: string
    name: string
    required: boolean
    localized: boolean
    type: FIELD_TYPE
    /**
     * Optional field only required when creating a field with FIELD_TYPE.LINK (e.g., relationships
     * to other records)
     */
    linkType?: string
}

var contentfulCmaToken = ``
var spaceId = ``
var environmentId = `master`
var blockModelId = ``

export const setContentfulCMAToken = ({ token }: { token: string }) => {
    contentfulCmaToken = token
}

export const getContentfulCMAToken = () => contentfulCmaToken

export const setSpaceId = ({ id }: { id: string }) => {
    spaceId = id
}

export const getSpaceId = () => spaceId

export const setEnvironmentId = ({ envId }: { envId: string }) => {
    environmentId = envId
}

export const getEnvironment = () => environmentId

export const setBlockModelId = ({ id }: { id: string } ) => {
    blockModelId = id
}

export const getBlockModelId = () => blockModelId

/**
 * Create a new content type
 * 
 * @param typeName              The name of the content model to create
 * @param fields                The fields for the content model being created
 * @see https://www.contentful.com/developers/docs/references/content-management-api/#/reference/content-types/content-type-collection/create-a-content-type/console
 */
export async function createContentType({ typeName, fields }: { typeName: string, fields: ContentTypeField[] }) {
    const endpoint = `${BASE_API_URL}/spaces/${spaceId}/environments/${environmentId}/content_types`
    console.log(`POST ENDPOINT: `, endpoint)
    return fetch(
        endpoint,
        {
            method: `POST`,
            headers: {
                "Authorization": `Bearer ${contentfulCmaToken}`,
                "Content-Type": `application/vnd.contentful.management.v1+json`
            },
            body: JSON.stringify({
                name: typeName,
                fields,
            })
        }
    )
    .then(res => res.json())
    .catch(err => console.error(`Unable to add content type '${typeName}': ${err.message}`))
}

// TODO: Add support to change the default locale (just needs logic added to the prompts so a user can change it to something other than 'en')
export async function createSpace({ spaceName, orgId, defaultLocale = `en` }: { spaceName: string, orgId: string, defaultLocale: string }) {
    const endpoint = BASE_API_URL + `/spaces`
    return fetch(
        endpoint,
        {
            method: `POST`,
            headers: {
                "Authorization": `Bearer ${contentfulCmaToken}`,
                "Content-Type": `application/vnd.contentful.management.v1+json`,
                "X-Contentful-Organization": `${orgId}`
            },
            body: JSON.stringify({
                name: spaceName,
                defaultLocale,
            })
        }
    )
    .then(res => res.json())
    .catch(err => console.error(`Unable to add space '${spaceName}': ${err.message}`))
}

/**
 * Publishes the given content type (by it's content type ID)
 * 
 * This method is required *after* creating a new content type programmatically; when you create a content type
 * via the API, it will not be active/published without calling this method.
 * 
 * @param param0 
 * @see https://www.contentful.com/developers/docs/references/content-management-api/#/reference/content-types/content-type-activation/activate-a-content-type/console
 */
export async function publishContentType({
    contentTypeId
} : {
    contentTypeId: string
}) {
    const endpoint = `${BASE_API_URL}/spaces/${spaceId}/environments/${environmentId}/content_types/${contentTypeId}/published`
    return fetch(
        endpoint,
        {
            method: `PUT`,
            headers: {
                "Authorization": `Bearer ${contentfulCmaToken}`,
                "Content-Type": `application/vnd.contentful.management.v1+json`,
                /**
                 * This IS NOT related to anything with an API version, but rather the version of the
                 * content type as it exists in your Space. For example, if this is the first time publishing
                 * a given content type, the version should be set to 1.
                 * 
                 * Setting this to an unexpected version will lead to VersionMismatch errors
                 */
                "X-Contentful-Version": `1`
            }
        }
    )
    // TODO: This request is supposed to return some data, but for whatever reason, it isn't - investigate why
    .then(res => res.json())
    .catch(err => console.error(`Unable to get environments: ${err.message}`))
}

type FieldKeyValuePairs = {
    [field: string]: {
        "en-US"?: string
        [arg: string]: any
    }
}

/**
 * Create an entry for the given content type
 * 
 * @param param0 
 */
export async function createContentTypeEntry({ contentTypeId, fields }: { contentTypeId: string, fields: FieldKeyValuePairs }) {
    const endpoint = `${BASE_API_URL}/spaces/${spaceId}/environments/${environmentId}/entries`
    return fetch(
        endpoint,
        {
            method: `POST`,
            headers: {
                "Authorization": `Bearer ${contentfulCmaToken}`,
                "Content-Type": `application/vnd.contentful.management.v1+json`,
                "X-Contentful-Content-Type": contentTypeId
            },
            body: JSON.stringify({
                ...fields
            })
        }
    )
    .then(res => res.json())
    .catch(err => console.error(`Unable to get environments: ${err.message}`))
}

// Just for testing
export async function getEnvironments() {
    const endpoint = `${BASE_API_URL}/spaces/${spaceId}/environments`
    return fetch(
        endpoint,
        {
            method: `GET`,
            headers: {
                "Authorization": `Bearer ${contentfulCmaToken}`,
                "Content-Type": `application/vnd.contentful.management.v1+json`,
            }
        }
    )
    .then(res => res.json())
    .catch(err => console.error(`Unable to get environments: ${err.message}`))
}
