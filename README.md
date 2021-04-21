# minecraft-asset-reader

A deveveloper tool intended to help mod and modpack maintainers create demo or documentation sites for their mod/modpack content. 

> This is under active development; as it stands, this repository contains code for a CLI tool that effectively takes a given assets path and creates a locally-hosted API out of your mod/modpack's data. From there, a webapp uses the API to display the data in an easy-to-read format, where the dev/maintainer can go through and curate the content they want to use for their site. Eventually, the webapp will be self-hosted in this CLI, but for now, the two projects are being developed separately.

**Key features**
1. Easy bulk-generation of isometric-view block icons
2. Blur-free image scaling
3. Sanity.io integration (_not implemented, yet_)

## Get started

Testing locally (from the source code)
1. Clone the project. 
2. Run `yarn` at the root
3. Run `yarn start`
5. Paste the assests directory path (it must be a complete path!)

## Resources
1. https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
2. https://itnext.io/simple-setup-for-your-typescript-project-d96f66113b41
4. https://www.npmjs.com/package/chalk - Colored text
5. https://www.npmjs.com/package/ora - Spinners
6. https://www.npmjs.com/package/ink - React-style components for CLI elements
7. https://www.npmjs.com/package/listr - Terminal task list
8. https://www.npmjs.com/package/boxen - Boxes in the terminal
