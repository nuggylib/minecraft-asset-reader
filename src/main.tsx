import { render } from "ink"
import React from "react"
import AppCache from "./cache/appCache"
// import { CLIApp } from "./CLIApp"
import { CLIApp } from "./CLIApp"

export const CACHE = new AppCache()

render(<CLIApp />)
