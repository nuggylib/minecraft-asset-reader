import { CreateProjectResponse, SanityMutation } from "../../types/sanity"
import fetch from "node-fetch"

const SANITY_API_VERSION = `v2021-03-25`

/**
 * @see https://www.sanity.io/docs/http-api
 * @see https://www.sanity.io/docs/http-urls
 * @see https://www.sanity.io/docs/http-auth
 */
export class SanityRESTClient {
  apiUrlBase: string
  authToken: string

  /**
   *
   * @param authToken     The auth token (obtained and provided by the user using the Sanity CLI)
   * @param projectId     optional project ID - when unset, it's assumed that the client instance will be used to perform account-level operations
   */
  constructor(authToken: string, projectId?: string) {
    this.apiUrlBase = !!projectId
      ? `https://${projectId}.api.sanity.io/${SANITY_API_VERSION}`
      : `https://api.sanity.io/${SANITY_API_VERSION}`
    this.authToken = authToken
  }

  /**
   * Create a project
   *
   * @param args
   * @returns
   */
  async createProject(args: { displayName: string }) {
    console.log(`USING DISPLAY NAME: `, args.displayName)
    return fetch(`${this.apiUrlBase}/projects`, {
      method: `POST`,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({
        displayName: args.displayName,
      }),
    })
      .then((res) => res.json())
      .then((resJson: CreateProjectResponse) => {
        console.log(`RES JSON: `, resJson)
        return {
          success: true,
          id: resJson.id,
          message: resJson.id,
        }
      })
  }

  /**
   * Executes a transaction with the given mutations
   *
   * @param args
   */
  async mutationTransaction(args: { mutations: SanityMutation[] }) {
    // TODO: Support non-default datasets
    return fetch(`${this.apiUrlBase}/data/mutate/production`, {
      method: `POST`,
      body: JSON.stringify({
        mutations: args.mutations,
      }),
    })
      .then((res) => res.json())
      .then((_resJson) => {
        // TODO: May need to handle errors here (e.g., if an "error" doesn't actually throw, but just returns error info in this block)

        return {
          success: true,
        }
      })
      .catch((e) => {
        return {
          success: false,
          message: e.message,
        }
      })
  }

  // TODO: Implement the patch API to handle updates
}
