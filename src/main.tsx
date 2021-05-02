import { render } from "ink"
import React from "react"
import AppCache from "./services/core/cache"
import { CLIApp } from "./CLIApp"
import { initServer } from "./services/core/server/server"

export const CACHE = new AppCache()

export function cli(_args: any) {
  initServer().then(() => render(<CLIApp />))
}
