import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { ConfigContentMap } from "./components/ConfigureContentMap"
require(`dotenv`).config()

ReactDOM.render(
  <React.StrictMode>
    <ConfigContentMap />
  </React.StrictMode>,
  document.getElementById(`root`)
)
