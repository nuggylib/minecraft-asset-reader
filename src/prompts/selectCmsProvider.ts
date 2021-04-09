import inquirer from "inquirer"
import { SUPPORTED_CMS_PROVIDERS } from "../constants"
import { createOrUseExistingPrompt } from "./contentful/createOrUseExistingApp"

export const selectCmsProviderPrompt = () =>
  inquirer
    .prompt([
      {
        type: `list`,
        name: `provider`,
        message: `Which provider would you like to store your site data in?`,
        choices: [SUPPORTED_CMS_PROVIDERS.CONTENTFUL],
      },
    ])
    .then((answers) => {
      switch (answers.provider) {
        case SUPPORTED_CMS_PROVIDERS.CONTENTFUL: {
          return createOrUseExistingPrompt()
        }
      }
    })
