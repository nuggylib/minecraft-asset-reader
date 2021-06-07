import React from "react"
import { Text, Box, Newline } from "ink"

type NumberedListItem = {
  text: string
  subItems?: {
    [key: string]: string
  }
}

export const NumberedList = (props: { items: NumberedListItem[] }) => (
  <>
    {props.items.map((item, index) => (
      <Box flexDirection="column" key={`item_${index}`}>
        <Box marginLeft={2}>
          <Text bold>
            {index + 1}. {item.text}
          </Text>
        </Box>
        {!!item.subItems
          ? Object.keys(item.subItems).map((subItem) => (
              <Box marginLeft={4} key={`item_${index}_sub-item_${subItem}`}>
                <Text>
                  {subItem}. {item.subItems![subItem]}
                </Text>
              </Box>
            ))
          : null}
        <Newline />
      </Box>
    ))}
  </>
)
