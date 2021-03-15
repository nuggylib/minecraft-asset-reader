import inquirer from "inquirer"
import { collectOrganizationId } from "./collectOrganizationId"


export const collectCredentialsPrompt = ({ redirect }: { redirect: string }) => inquirer.prompt([
    {
        type: 'input',
        name: 'clientId',
        message: "Client ID:",
    },
    {
        type: 'input',
        name: 'clientSecret',
        message: "Client Secret:",
    },
])
.then(answers => collectOrganizationId({
    redirect,
    clientId: answers.clientId,
    clientSecret: answers.clientSecret
}))