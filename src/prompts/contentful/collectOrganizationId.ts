import inquirer from "inquirer"
import open from "open"
import { createSiteDataPrompt } from "./createSiteData"

export const collectOrganizationId = (
    { 
        clientId, 
        clientSecret, 
        redirect 
    }: { 
        clientId: string, 
        clientSecret: string, 
        redirect: string 
    }) => inquirer.prompt([
    {
        type: 'input',
        name: 'organizationId',
        message: "Organization ID:",
    },
])
.then(answers => {
    open(`https://be.contentful.com/oauth/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirect}&scope=content_management_manage`)
    return answers
})
.then(answers => createSiteDataPrompt({ organizationId: answers.organizationId }))