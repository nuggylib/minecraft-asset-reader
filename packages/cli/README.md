# minecraft-asset-reader

A deveveloper tool intended to help mod and modpack maintainers create demo or documentation sites for their mod/modpack content.

> This is under active development; as it stands, this repository contains code for a CLI tool that effectively takes a given assets path and creates a locally-hosted API out of your mod/modpack's data. From there, a webapp uses the API to display the data in an easy-to-read format, where the dev/maintainer can go through and curate the content they want to use for their site. Eventually, the webapp will be self-hosted in this CLI, but for now, the two projects are being developed separately.

### Why does this exist?

If you're into modding Minecraft and have wanted to showcase your mod content, you've likely run into an issue where the game assets are too small. Plus, many models are comprised of multiple different assets, making it impossible for you to use an image of something like a modded block _without_ manually capturing screenshots.

While screenshotting your mod content may be alright when you have a small mod, it quickly becomes a pain when you have a large mod with a lot of moving pieces. In our experience, it seems that most modders end up being forced to go the route of simply not maintaining a demo/documentation site for their mod. _This is why `minecraft-asset-reader` exists; **to make it easy to generate custom boilerplate site content using your own game files**_. Feature list (checked items are already supported):

- [x] Isometric block rendering
- [x] Support for multiple image scale sizes
  - Currently, only blocks are supported
- [ ] Transparent block rendering
- [ ] Atypical block model rendering (e.g., Brewing Stand)

## Isometric block rendering

In order to render a block, you need to configure a given block's top, left and right side textures to use. When exporting the data, the `minecraft-asset-reader` tool will generate a rendering of the block meant to emulate an isometric view of the block.

## Get started

Testing locally (from the source code)

1. Clone the project.
2. Run `yarn` at the root
3. Run `yarn start`
4. Paste the assests directory path (it must be a complete path!)

## Resources

1. https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
2. https://itnext.io/simple-setup-for-your-typescript-project-d96f66113b41
3. https://www.npmjs.com/package/chalk - Colored text
4. https://www.npmjs.com/package/ora - Spinners
5. https://www.npmjs.com/package/ink - React-style components for CLI elements
6. https://www.npmjs.com/package/listr - Terminal task list
7. https://www.npmjs.com/package/boxen - Boxes in the terminal
