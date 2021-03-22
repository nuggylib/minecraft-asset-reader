import { Text } from "ink"
import { times } from "lodash"
import React from "react"

/**
 * Helper component to make it easier to implement "tabs" in the terminal
 * output. We use 2 spaces instead of `\t` simply because the spacing is far too wide,
 * otherwise
 * 
 * @param param0 
 * @returns 
 */
export const Tab = ({ count }: { count: number }) => <Text>{
        times(count, () => `  `)
    }</Text>