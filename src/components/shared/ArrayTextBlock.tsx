import { Box, Text } from "ink"
import React from "react"
import { Tab } from "./Tab"

export const ArrayTextBlock = (props: {
  label: string
  nestingDepth: number
  array: string[]
}) => (
  <>
    <Text>
      <Tab count={3} />
      {props.label}:{` `}
      {props.array.map((val, index) => {
        let str = val
        if (index !== props.array.length - 1) {
          str += `, `
        }
        return str
      })}
    </Text>
  </>
)
