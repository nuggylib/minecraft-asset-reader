import React from "react"
import { Text } from "ink"
import Spinner from "ink-spinner"

export const LoadingIndicator = (props: { loadingText: string }) => (
  <Text>
    <Text color="blue">
      <Spinner type="dots" />
    </Text>
    {`${props.loadingText}`}
  </Text>
)
