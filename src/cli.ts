import inquirer from "inquirer"
import chalk from "chalk"
import boxen from "boxen"
import { validateAssetsDirAndGenerateData } from "./minecraft";
import { readBlockstates, readModels, readTextures } from "./minecraft/readData";
import { resourceData } from "./contentGenerator";

export const log = console.log;

// See https://www.npmjs.com/package/boxen
// See https://www.npmjs.com/package/chalk
log(boxen(chalk.white.bgBlue.bold('** Minecraft asset reader **'), {padding: 1, margin: 1, borderStyle: 'double'}));

log(boxen(chalk.white('Minecraft asset reader'), {padding: 1, margin: 1}));

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
  log(`Loaded asset data: `, resourceData)
})
.catch(error => {
  if(error.isTtyError) {
    // Prompt couldn't be rendered in the current environment
    log(error.message)
  } else {
    // Something else went wrong
    log(error.message)
  }
})