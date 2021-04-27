import { CreateProjectResponse, SanityMutation } from "../../types/sanity"

const SANITY_API_VERSION = `v2021-03-25`

/**
 * Because Sanity is usually self-hosted, there isn't a need to upload data through
 * the API. Instead, this client should help with:
 * 1. Creating a new Sanity project studio for the user's site
 * 2. Bootstrapping the new studio with the site data
 * 
 * The user will need to install the Sanity CLI and login (so they can get their secret token)
 * 
 * @see https://www.sanity.io/docs/http-api
 * @see https://www.sanity.io/docs/http-urls
 * @see https://www.sanity.io/docs/http-auth
 */
export class SanityClient {
    apiUrlBase: string
    apiToken: string
    
    /**
     * 
     * @param authToken     The auth token (obtained and provided by the user using the Sanity CLI)
     * @param projectId     optional project ID - when unset, it's assumed that the client instance will be used to perform account-level operations 
     */
    constructor(authToken: string, projectId?: string) {
        this.apiUrlBase = !!projectId ? `https://${projectId}.api.sanity.io/${SANITY_API_VERSION}` : `https://api.sanity.io/${SANITY_API_VERSION}`
        this.apiToken = authToken
    }

    /**
     * Create a project
     * 
     * @param args 
     * @returns 
     */
    async createProject(args: {
        displayName: string
    }) {
        return fetch(`${this.apiUrlBase}/projects`, {
            method: `POST`,
            body: JSON.stringify({
                displayName: args.displayName
            })
        })
        .then(res => res.json())
        .then((resJson: CreateProjectResponse) => {
            return {
                success: true,
                id: resJson.id,
                message: resJson.id
            }
        })
        .catch(e => {
            return {
                success: false,
                message: e.message
            }
        })
    }

    /**
     * Executes a transaction with the given mutations
     * 
     * @param args 
     */
    async mutationTransaction(args: {
        mutations: SanityMutation[],
    }) {
        // TODO: Support non-default datasets
        return fetch(`${this.apiUrlBase}/data/mutate/production`, {
            method: `POST`,
            body: JSON.stringify({
                mutations: args.mutations
            })
        })
        .then(res => res.json())
        .then(_resJson => {

            // TODO: May need to handle errors here (e.g., if an "error" doesn't actually throw, but just returns error info in this block)

            return {
                success: true
            }
        })
        .catch(e => {
            return {
                success: false,
                message: e.message,
            }
        })
    }
}
