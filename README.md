# Readme

Monorepo for the `minecraft-asset-reader` CLI tool. This repository contains both the CLI code and the webapp code.

## Basic commands

1. Running the CLI locally: `yarn start:cli` (start this first when testing locally so you can use React's port-conflict resolution logic)
2. Running the client locally: `yarn start:client`

## Known and related issues

1. Lerna doesn't install all dependencies when running `bootstrap`
   - SOURCE: https://github.com/lerna/lerna/issues/1457
   - **WORKAROUND**
     - _Install the dependencies within the broken package directory by `cd`ing into the root of the affected package and run `yarn`; once complete, `cd` back to the project root. You should now be able to run the package-specific start command (e.g., `yarn start:cli`)_
