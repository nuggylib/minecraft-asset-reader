import { render } from "ink"
import React from "react"
import AppCache from "./cache"
import { CLIApp } from "./CLIApp"
import { initServer } from "./server/server"
import { Dao } from "./db"

export const CACHE = new AppCache()

export function cli(_args: any) {
  initServer()
    .then(() => Dao())
    .then((db) => db.initMainDb())
    .then((_initResult) => render(<CLIApp />))
    .catch((e) => console.error(e))
}
/**
 * We need to make sure the CLI app works locally as well as bundled.
 * When you run the app locally, it calls the `cli` function from `main.tsx`.
 * When you run the app as a "built app," it should call the script in `package.json`.
 * We accomplish this by detecting whether the `process.env.LOCAL` variable exists.
 * If it does, we run `cli` directly.
 */
if (process.env.LOCAL) {
  cli({})
}
