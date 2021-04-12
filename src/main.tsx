import { render } from "ink"
import React from "react"
import AppCache from "./cache/appCache"
// import { CLIApp } from "./CLIApp"
import { CLIApp } from "./CLIApp"
import { initServer } from "./server/server"

export const CACHE = new AppCache()

initServer().then(() => render(<CLIApp />))
