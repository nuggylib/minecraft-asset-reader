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

cli({})
