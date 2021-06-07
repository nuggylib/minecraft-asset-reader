# Minecraft asset reader webapp

> This project is still under development; it's intended to be used with the [Minecraft Asset Reader](https://github.com/nuggylib/minecraft-asset-reader) CLI tool. Eventually, this site will be built and packaged within the asset reader CLI so that it can be served up from within the CLI tool, without the user having to start this webapp up themselves. However, until that time, this project can only be tested if you are also running the CLI tool separately.

## Testing steps

1. Clone the [Minecraft Asset Reader](https://github.com/nuggylib/minecraft-asset-reader) repository > install dependencies with `yarn` > run `yarn start`
2. (Still in the CLI) > provide a path to a valid assets directory (a good test is the Minecraft 1.12.2 base game assets directory - see below for info)
3. (Still in the CLI) Click "Bootstrap" > the menu will re-render, but nothing new will show up (e.g., after clicking this, it will currently appear to do "nothing", but it actually did do it's job)
   - Note that Bootstrap operation is idempotent, so there is no harm in clicking it a bunch of times in quick succession
4. **Leave the CLI tool running; it runs a server hosting your imported data for the webapp to consume**
5. Open a new terminal tab
6. `cd` into this repository > run `yarn start` > there is currently a port conflict; just enter "y" when it asks if you want to use a different port
7. Test!

### Getting sample data to test with

As mentioned above, a good test could be the assets for Minecraft 1.12.2. Technically, any version of minecraft that has an `assets` directory in the root will work, but we've been using 1.12.2 since we have a mod we are working on that uses that version.

**Due to potential copyright issues, I don't think I can provide any "official" Minecraft assets in this repository.** With that said, _if you have a Minecraft account_ you can test this without issue.

1. Download the Minecraft installer (if you haven't already)
2. Select the version of Minecraft you want to install
3. Launch the game once so all the game files are downloaded (it only needs to load into the main screen)
4. `cd` to where your Minecraft game files are saved (for Linux users, this is usually in the `~/.minecraft` directory
5. `cd` to `versions/<VERSION_NUM>` and extract `<VERSION_NUM>.jar`
6. `cd` into the `assets` directory of the newly-created directory, `<VERSION_NUM>/assets` > run `pwd` > **this is your base assets path**
   - _Once you have the base assets path, you have all you need to test this end-to-end (if you didn't already have test data)_
