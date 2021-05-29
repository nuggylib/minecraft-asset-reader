# Readme

Minecraft asset reader is a tool to assist Minecraft mod developers and modpack maintainers export their game content, configured for use in a production-ready demonstration site.

## Why would I need this?

### Bulk image-scaling

By default, Minecraft assets are very small (with block textures typically being 16x16 pixels). These low-resolution images are what gives Minecraft its iconic "retro" look, but without some extra steps, they are blurry when scaled up.

While you could use some tools to manually scale up each image, it's tedious to do this when you have a lot of images to scale up. The Minecraft Asset Reader tool automatically-handles scaling up all textures to the desired base size. We recommend using a scale around 20 for the base image sizes; larger sizes tend to be over the limit for Sanity asset upload sizes.

#### But what if I want more than one scale size?

Use Sanity! We chose Sanity as the CMS to export to for its versatility. Once an image asset has been uploaded to Sanity, you can specify dimensions when querying for the data to resize it.

In short, once you have the image in Sanity, you can resize it however you see fit! See https://www.sanity.io/docs/image-urls

### Emulated isometric block icons

Minecraft block textures are separated by their sides; _there is no "isometric view" image for a block in the game files_. The Minecraft game code is responsible for parsing the model definitions and rendering the textures where they are needed in-game.

To get around this, the Minecraft Asset Reader block configuration modal allows the user to specify which textures to use for the top, left and right sides of the block in order to render an emulated isometric view of the block. All the user needs to do is specify the sides to use, and Minecraft Asset Reader handles the rest!

## Complete workflow

> You will need your own [Netlify](https://www.netlify.com/) account to complete the steps in this section.

1. Navigate to the [One-Click Minecraft Blog Starter](https://www.sanity.io/create?template=nuggylib/sanity-template-minecraft-blog) page
2. Give your project a title
3. Connect your GitHub account > set a repository name
4. Connect your Netlify account
5. Click "Create Project" > wait for the Studio deployment to complete
6. Once available, click the button to navigate to your Sanity Studio; **this is where you will moderate your content, later**
   - If you closed the tab with your Sanity deploy information, you can also get to your Studio by logging into Netlify and navigating to the deployment
7. Start the Minecraft Asset Reader tool
8. Set your root assets directory
9. Using the web app, configure the content you want to export to the Sanity studio
10. Once ready, open the side bar and click "Export"
11. Toggle to "Sanity" (_note: "fs" is an option, but it does nothing - we are removing this option soon_) and provide the following:
    1. Project ID
    2. Dataset
    3. Auth Token (use `sanity debug --secrets` to get this)
12. **Make sure there is only one scale when exporting (becuase we only use the first one, now)** (_note: we are removing the ability to specify an array of scales in the near-future_)
    - TIP: A good size to use is `20` - yields a nice-quality image, without going over Sanity's upload size limits
13. Click "Submit" and wait for the export to complete

## Basic commands

1. Running the CLI locally: `yarn start:cli` (start this first when testing locally so you can use React's port-conflict resolution logic)
2. Running the client locally: `yarn start:client`

## Known and related issues

1. Lerna doesn't install all dependencies when running `bootstrap`
   - SOURCE: https://github.com/lerna/lerna/issues/1457
     - We hit this issue consistently with the `ink` package; it never seems to install with `lerna`
   - **WORKAROUND**
     - _Install the dependencies within the broken package directory by `cd`-ing into the root of the affected package and run `yarn`; once complete, `cd` back to the project root. You should now be able to run the package-specific start command (e.g., `yarn start:cli`)_
2. Versions 5.0.0 and 5.0.2 ("current" version) of `sqlite3` can fail when running certain SQL operations in worker threads
   - SOURCE: https://github.com/mapbox/node-sqlite3/issues/1381
   - **WORKAROUND**
     - _Use version `4.2.0` of `sqlite3`_
3. Sanity does not allow you to create content type definitions through the API
   - SOURCE: _"experience"_; This is a known limitation - the schema is defined as JS/TS files in the Sanity studio, so it's independent of the API
   - **WORKAROUND**
     - _Create a custom "minecraft asset reader" Sanity studio and use it during the bootstrap process_
     - With this flow, you won't need to download or generate any schema files - simply give the starter the requisite types
     - Admittedly, this isn't as easy as simply setting up a project with content types (e.g., as Contentful, Flotiq, and many others allow)
