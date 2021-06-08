Installation:

```
npm i -g minecraft-asset-reader
```

Then, run it with:

```
minecraft-asset-reader
```

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
11. We currently only support exporting to sanity.io - you will need to provide the following before you can export:
    1. Project ID
    2. Dataset
    3. Auth Token (use `sanity debug --secrets` to get this)
12. **Make sure there is only one scale when exporting (becuase we only use the first one, now)** (_note: we are removing the ability to specify an array of scales in the near-future_)
    - TIP: A good size to use is `20` - yields a nice-quality image, without going over Sanity's upload size limits
13. Click "Submit" and wait for the export to complete

## Basic commands

1. Running the CLI locally: `yarn start:cli` (start this first when testing locally so you can use React's port-conflict resolution logic)
2. Running the client locally: `yarn start:client`

## Building and running the app

To build the standalone application:

```bash
yarn build-app
```

To run the built application code:

```bash
yarn run-app
```

- When running the built application code, there is an additional menu option, "Open webapp"
  - Use this menu option anytime you need to use the webapp

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

## Dependency notes

This section contains information about specific cases where there is "a reason" behind why we are using a specific dependency (or version of a dependency). \_This is not a comprehensive list of dependencies used in this project, but rather explanations about how we handled various Dependabot alerts (among other things).

1. **PostCSS** - `^7` - _this version has a moderate vulnerability and it's recommended we update to `>=8.2.10`_
   - We can't easily fix this as it's a problem with `create-react-app`, which does not work with version 8
   - See: https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users
2. **`ws` (indirect-dependency)** - _Any version 7 `ws` lower than `7.4.6` is vulnerable to attack via a specially-crafted `Sec-Websocket-Protocol` header_
   - No need for us to fix this, as the server for this application is intended only to be hosted locally, while a user is configuring their site content
     - The only threat would be from the user themselves (meaning they would have to manually host the app, craft the header, then attack themselves for no reason whatsoever)
     - DO NOT TRIVIALIZE THIS - if, for whatever reason, you do intend to host this app, know that the app will have this vulnerability and you will need to find a fix (yes, we are open to PRs!)
   - See: https://github.com/advisories/GHSA-6fc8-4gx4-v693
