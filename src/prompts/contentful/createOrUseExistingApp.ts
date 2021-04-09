import inquirer from "inquirer"
import { collectCredentialsPrompt } from "./collectCredentials"
import {
  CONTENTFUL_OAUTH_APPS_ADDRESS,
  CREATE_CONTENTFUL_OAUTH_ADDRESS,
} from "./constants"

enum CHOICES {
  CREATE = `Create`,
  USE_EXISTING = `Use existing`,
}

export const createOrUseExistingPrompt = () =>
  inquirer
    .prompt([
      {
        type: `list`,
        name: `choice`,
        message: `You'll need an app to continue - would you like to create one, or use an existing app?`,
        choices: [CHOICES.CREATE, CHOICES.USE_EXISTING],
      },
    ])
    .then((answers) => {
      // const redirect = `${ngrokUrl}/oauth/contentful`
      const redirect = `/oauth/contentful`
      switch (answers.choice) {
        case CHOICES.CREATE: {
          console.log(
            `Navigate to ${CREATE_CONTENTFUL_OAUTH_ADDRESS} to create OAuth app credentials (you can delete this app later after importing data)`
          )
          console.log(`Provide a name and description`)
          console.log(`Set the redirect URI to '${redirect}'`)
          // TODO: Complete walking the user through the "create app" flow
          //   open(`https://be.contentful.com/oauth/authorize?response_type=token&client_id=${process.env.CONTENTFUL_CLIENT_ID}&redirect_uri=${redirect}&scope=content_management_manage`)
          break
        }
        case CHOICES.USE_EXISTING: {
          console.log(
            `Navigate to ${CONTENTFUL_OAUTH_APPS_ADDRESS} and select the app to use (note that the redirect URL must point to '${redirect}'; you may need to update the app before continuing)`
          )
          return collectCredentialsPrompt({
            redirect,
          })
        }
      }
    })
