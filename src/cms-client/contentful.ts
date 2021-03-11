

const BASE_API_URL = `https://api.contentful.com`

/**
 * The field types for Contentful content models
 * 
 * @see https://www.contentful.com/developers/docs/concepts/data-model/
 */
enum FIELD_TYPE {
    "Symbol",
    "Text",
    "Integer",
    "Number",
    "Date",
    "Location",
    "Boolean",
    "Link", // For media and reference types
    "Array",
    "Object",
}

// TODO: Find out what other fields there may be - also, find out which are optional
type ContentTypeField = {
    id: string
    name: string
    required: boolean
    localized: boolean
    type: FIELD_TYPE
}

export class ContentfulClient {
    spaceId: string
    environmentId: string
    cmaToken: string
    constructor({ spaceId, environmentId, cmaToken }: { spaceId: string, environmentId: string, cmaToken: string }) {
        this.spaceId = spaceId
        this.environmentId = environmentId
        this.cmaToken = cmaToken
        
    }

    /**
     * Create a new content type
     * 
     * @param typeName              The name of the content model to create
     * @param fields                The fields for the content model being created
     * @see https://www.contentful.com/developers/docs/references/content-management-api/#/reference/content-types/content-type-collection/create-a-content-type/console
     */
    async createContentType({ typeName, fields }: { typeName: string, fields: ContentTypeField[] }) {
        const endpoint = BASE_API_URL + "/spaces/" + this.spaceId + "/environments/" + this.environmentId + "/content_types"
        return fetch(
            endpoint,
            {
                method: `POST`,
                headers: {
                    "Authorization": `Bearer ${this.cmaToken}`,
                    "Content-Type": `application/vnd.contentful.management.v1+json`
                },
                body: JSON.stringify({
                    name: typeName,
                    fields,
                })
            }
        )
        .then(res => res.json())
    }
}