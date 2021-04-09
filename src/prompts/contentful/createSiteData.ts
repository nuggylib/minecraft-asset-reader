import inquirer from "inquirer"
import {
  createContentType,
  createContentTypeEntry,
  createSpace,
  FIELD_TYPE,
  getBlockModelId,
  getEnvironments,
  LINK_TYPE,
  publishContentType,
  setBlockModelId,
  setSpaceId,
} from "../../cms-client/contentful/contentful"
import { BLOCK_PAGES } from "../../types"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function avoidRateLimit() {
  console.log(
    `Sleeping for .25 sec to cirvumvent rate limit (7 requests per second)`
  )
  await sleep(250)
}

// export const createSiteDataPrompt = ({ organizationId } : { organizationId: string } ) =>
// inquirer.prompt([
//     {
//         type: 'input',
//         name: 'spaceName',
//         message: "Enter a name for your site's data collection (called a 'Space' in Contentful) - for example, your mod's name:",
//     },
// ])
// .then(answers => createSpace({
//     spaceName: answers.spaceName,
//     orgId: organizationId,
//     defaultLocale: `en`
// }))
// .then(resJson => {
//     console.log(`RESPONSE JSON: `, resJson)
//     // When the contentful API hits an error, it doesn't throw, but returns a valid response saying what went wrong - need to handle this manually
//     if (resJson.sys.type === `Error`) {
//         // TODO: When we hit this, we should let the user opt to try another provider that we support - for now, just stop the app
//         throw new Error(`You've hit your space limit for your account - either upgrade your subscription, or delete an existing space that you no longer need.`)
//     }
//     setSpaceId({
//         id: resJson.sys.id
//     })
// })
// .then(() => avoidRateLimit())
// .then(() => {
//     return createContentType({
//         typeName: "Block",
//         fields: [
//             {
//                 id: `title`,
//                 name: `Title`,
//                 required: true,
//                 localized: false,   // TODO: What should this be?
//                 type: FIELD_TYPE.SYMBOL
//             },
//             {
//                 id: `icon`,
//                 name: `Icon`,
//                 required: false,
//                 localized: false,
//                 linkType: LINK_TYPE.ASSET,
//                 type: FIELD_TYPE.LINK
//             },
//             {
//                 id: `models`,
//                 name: `Model File Names`,
//                 required: false,
//                 localized: false,
//                 type: FIELD_TYPE.ARRAY
//             },
//             {
//                 id: `description`,
//                 name: `Description`,
//                 required: false,
//                 localized: false,
//                 type: FIELD_TYPE.TEXT
//             },
//             {
//                 id: `variantModels`,
//                 name: `Variant Model File Names`,
//                 required: false,
//                 localized: false,
//                 type: FIELD_TYPE.ARRAY
//             },
//             {
//                 id: `textures`,
//                 name: `Textures`,
//                 required: false,
//                 localized: false,
//                 type: FIELD_TYPE.ARRAY
//             },
//             {
//                 id: `multipartCases`,
//                 name: `Multipart Cases`,
//                 required: false,
//                 localized: false,
//                 type: FIELD_TYPE.ARRAY
//             },
//         ]
//     })
// })
// .then(resJson => {
//     console.log(`RES JSON: `, resJson)
//     if (resJson.sys.type === `Error`) {
//         var string = `MESSAGES:\n`
//         resJson.details.errors.forEach((err: any) => {
//             console.log(`ERROR: `, err)
//             string += `\tUnable to create field '${err.value}' - ${err.details}`
//             if (err.expected) {

//             }
//         })
//         throw new Error(string)
//     }
//     // We've gotten the BlockModel ID back from contentful - we can now activate it
//     setBlockModelId({
//         id: resJson.sys.id
//     })
// })
// .then(() => avoidRateLimit())
// .then(() => {
//     return publishContentType({
//         contentTypeId: getBlockModelId()
//     })
// })
// .then(() => avoidRateLimit())
// .then(() => {
//      // Long-running operation
//     const blockPagePromises = BLOCK_PAGES.map(blockPage => {
//         return createContentTypeEntry({
//             contentTypeId: getBlockModelId(),
//             fields: {
//                 title: {
//                     "en-US": blockPage.title
//                 },
//                 // TODO: How do we set non-string fields? Contentful's docs are ass
//                 models: blockPage.models.map(modelName => {
//                     return {
//                         "en-US": modelName
//                     }
//                 }),
//                 variantModels: blockPage.variantModelNames ? blockPage.variantModelNames!.map(variantModelName => {
//                     return {
//                         "en-US": variantModelName
//                     }
//                 }) : [],
//             }
//         })
//         .then(resJson => {
//             console.log(`Create Content Type response: `, resJson)
//             return avoidRateLimit()
//         })
//     })
//     blockPagePromises.reduce((p, fn) => p.then(() => fn), Promise.resolve())
// })
// .catch(err => {
//     console.error(`Unable to create site data in Contentful: ${err.message}`)
// })
