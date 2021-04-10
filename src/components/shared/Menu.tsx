import React from "react"
import SelectInput from "ink-select-input"
import { Box, Text } from "ink"
import { OPTION_VALUE } from "../../CLIApp"

export const Menu = (props: {
  title: string
  options: {
    label: string
    value: string
  }[]
  onSelectHandler: (option: { label: string; value: string }) => void
}) => (
  <>
    <Box marginLeft={1}>
      <Text bold color="blue">
        {props.title}
      </Text>
    </Box>
    <SelectInput items={props.options} onSelect={props.onSelectHandler} />
  </>
)
