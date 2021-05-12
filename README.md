# Readme

Monorepo for the `minecraft-asset-reader` CLI tool. This repository contains both the CLI code and the webapp code.

The main use case for this tool is to **make it easy to configure demo/portfolio site content using custom-generated assets and template content _based on your mod/modpack's code_.** In other words, _this makes it easy to create site content for your mod/modpack by_:

1. Bulk-generation of scaled and rendered images (no need to manually-rescale/redraw the 16x16 images - we do it for you!)
   - You can even specify a wide range of scale sizes for supported content types (there are some limitations)
2. Generation of template schemas based on your mod/modpack content
3. Data export to local file system
4. Data export to Sanity.io

## General usage

1. Start the CLI tool first - `yarn start:cli`
2. Start the webapp - `yarn start:client`
3. In the CLI tool, provide a path to a valid assets directory
4. Navigate to `localhost:3000` to use the webapp

## Example views

### CLI example

![CLI_example](https://user-images.githubusercontent.com/14364659/117087411-f9fd2480-ad14-11eb-8b13-d842e4b5b1d7.png)

### Webapp example (main view)

![example_webapp_view](https://user-images.githubusercontent.com/14364659/117087431-0b463100-ad15-11eb-9142-7a6f4204bbfe.png)

### Webapp - block config

![image](https://user-images.githubusercontent.com/14364659/117509893-a70fb100-af50-11eb-9645-d1d3d89a95a1.png)

### Example generated Block in Sanity.io Studio

![sanity_block_config](https://user-images.githubusercontent.com/14364659/117087533-60824280-ad15-11eb-8b51-9d9b83edfb0e.png)

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
