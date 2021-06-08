import React from "react"
import { BlockDataConfig } from "./BlockDataConfig"

export const ConfigureNamespace = (props: { namespace: string }) => (
  <div>
    <h2>{props.namespace}</h2>
    <br />
    <BlockDataConfig namespace={props.namespace} />
  </div>
)
