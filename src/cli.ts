import inquirer from "inquirer"
import chalk from "chalk"
import boxen from "boxen"
import { validateAssetsDirAndGenerateData } from "./minecraft";
import { readBlockstates, readModels, readTextures } from "./minecraft/readBlockData";
import { resourceData, generateBlockPageData } from "./contentGenerator";
import { BLOCK_PAGES } from "./types";

export const log = (message: string) => console.log(chalk.blueBright("[LOG]: ", message));

export const error = (message: string) => console.error(chalk.red("[ERROR]: ", message))

export const warn = (message: string) => console.warn(chalk.yellow("[WARN]: ", message))

// See https://www.npmjs.com/package/boxen
// See https://www.npmjs.com/package/chalk
console.log(boxen(chalk.white.bgBlue.bold('** Minecraft asset reader **'), {padding: 1, margin: 1, borderStyle: 'double'}));

console.log(boxen(chalk.white('Minecraft asset reader'), {padding: 1, margin: 1}));

// See https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer/examples
inquirer.prompt([
  {
    type: 'input',
    name: 'assetsPath',
    message: '\'assets\' directory path:',
    validate: answer => {
      var lastPart = answer.split("/").pop()
      if (lastPart === 'assets') {
        var isValidAssetsDir = validateAssetsDirAndGenerateData({
          path: answer
        })
        if (!isValidAssetsDir) {
          return 'Not a valid assets directory'
        }
        return true
      } else {
        return 'Path must end in \'assets\''
      }   
    }
  },
])
.then(( { assetsPath } ) => {
  const keys = Object.keys(resourceData)
  keys.forEach(key => readBlockstates({ 
        namespace: key,
        path: assetsPath
  }))
  keys.forEach(key => readModels({ 
    namespace: key,
    path: assetsPath
  }))
  keys.forEach(key => readTextures({ 
    namespace: key,
    path: assetsPath
  }))
  generateBlockPageData({
    assetsPath
  })
  console.log(`BLOCK PAGES: `, BLOCK_PAGES)
})
.catch(error => {
  if(error.isTtyError) {
    // Prompt couldn't be rendered in the current environment
    error(error.message)
  } else {
    // Something else went wrong
    error(error.message)
  }
})