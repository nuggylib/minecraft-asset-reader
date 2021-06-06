#!/usr/bin/env node
/* eslint-disable no-console, no-process-exit, no-sync */
const path = require(`path`)
const fse = require(`fs-extra`)
const webpack = require(`webpack`)
const klawSync = require(`klaw-sync`)

const shebangLoader = require.resolve(`./shebang-loader`)
const basedir = path.join(__dirname, `..`)
const modulesDir = path.join(basedir, `node_modules`)
const isAllowedNativeModule = (mod) => {
  const modName = mod.path.slice(modulesDir.length + 1).split(path.sep)[0]
  return ![`fsevents`].includes(modName)
}

console.log(`Building CLI to a single file`)

// Make sure there are no native modules
const isBinding = (file) => path.basename(file.path) === `binding.gyp`
const bindings = klawSync(modulesDir, {
  nodir: true,
  filter: isBinding,
}).filter(isAllowedNativeModule)

/**
 * N.B.
 *
 * We stop building when a native module ("addon") is detected since it has a high-likelihood of causing compatibility issues
 * (and not just by operating system). The compiled C++ binaries are different on many systems due to a variety of factors
 * including:
 * 1. Operating System
 * 2. CPU architecture
 * 3. CPU addressing space
 * 4. (Linuxes) The version of Libc used
 *
 * Due to these variations, we simply prevent all native modules from being used in the application. This check prevents them
 * from sneaking into the packaged code. It should still be possible to use native modules while developing locally, but you
 * will need to find something else to use in the packaged code. (Sometimes, it's just easier to slap in a native module when you
 * just want to see something working as a POC in the short-term - that should still be a usable workflow).
 *
 * @see https://nodejs.org/api/addons.html
 * @see https://www.reddit.com/r/node/comments/jcjlav/nodegyp_why_does_it_cause_so_many_problems/
 */
if (bindings.length > 0) {
  console.error(
    `Native modules ("addons") cannot be used as they cause compatibility errors. You will need to find alternatives, or remove them altogether.`
  )
  console.error(`Native module(s) detected:`)
  bindings.forEach((file) => console.error(file.path))
  process.exit(1)
}

// Get path to `open` module
const openDir = path.dirname(require.resolve(`open`))
/**
 * Get path to the xdg-open script packaged within the `open` module
 *
 * @see https://unix.stackexchange.com/questions/340531/launch-executable-with-xdg-open
 */
const xdgPath = path.join(openDir, `xdg-open`)
// Copy the xdg-open script to the bin directory
fse.copy(xdgPath, path.join(basedir, `bin`, `xdg-open`))

const perterter = fse.readFileSync(
  path.join(basedir, `build-tsconfig.json`),
  `utf8`
)
console.log(`MERSHED: `, perterter)

const tsConfig = JSON.parse(perterter)

// Use the real node __dirname and __filename in order to get Yarn's source
// files on the user's system
const nodeOptions = {
  __filename: false,
  __dirname: false,
}

const compiler = webpack({
  mode: `production`,
  entry: {
    "minecraft-asset-reader": path.join(basedir, `bin/entry.js`),
  },
  output: {
    pathinfo: true,
    filename: `minecraft-asset-reader.js`,
    path: path.join(basedir, `bin`),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: `ts-loader`, options: tsConfig }],
      },
      {
        test: /node_modules[/\\](rc)[/\\]/,
        use: [{ loader: shebangLoader }],
      },
    ],
  },
  resolve: {
    extensions: [`.tsx`, `.ts`, `.js`],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: `#!/usr/bin/env node`,
      raw: true,
    }),
    new webpack.DefinePlugin({
      __MINECRAFT_ASSET_READER_IS_BUNDLED__: JSON.stringify(true),

      // TODO: This a workaround Sanity is using - find out if we actually need to use this
      // Workaround for rc module console.logging if module.parent does not exist
      "module.parent": JSON.stringify({}),
    }),
  ],
  target: `node`,
  node: nodeOptions,
})

compiler.run((err, stats) => {
  if (err) {
    throw err
  }

  const filtered = stats.compilation.warnings.filter(
    (warn) =>
      !warn.origin ||
      (warn.origin.userRequest.indexOf(`spawn-sync.js`) === -1 &&
        warn.origin.userRequest.indexOf(`write-file-atomic`) === -1)
  )

  if (filtered.length > 0) {
    console.warn(`=== [  Warnings  ]========`)
    filtered.forEach((warn) => {
      console.warn(warn.origin ? `\n${warn.origin.userRequest}:` : `\n`)
      console.warn(`${warn}\n`)
    })
    console.warn(`=== [ /Warnings  ]========\n`)
  }

  if (stats.compilation.errors.length > 0) {
    console.error(stats.compilation.errors)
    process.exit(1)
  }

  // Make the file executable
  const outputPath = path.join(basedir, `bin`, `minecraft-asset-reader`)
  fse.chmodSync(outputPath, 0o755)

  // Make paths more dynamic
  let replacePath = path.normalize(path.join(__dirname, `..`))

  const content = fse.readFileSync(outputPath, `utf8`)
  const replaceRegex = new RegExp(escapeRegex(`*** ${replacePath}`), `ig`)
  const normalized = content.replace(replaceRegex, `*** `)
  fse.writeFileSync(outputPath, normalized, `utf8`)

  console.log(`Done packing.`)
})

function escapeRegex(string) {
  return `${string}`.replace(/([?!${}*:()|=^[\]/\\.+])/g, `\\$1`)
}
