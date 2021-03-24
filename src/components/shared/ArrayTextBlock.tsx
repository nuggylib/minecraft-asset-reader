import { Box, Text } from "ink"
import React from "react"
import { Tab } from "./Tab"

export const ArrayTextBlock = ({label, array }: {label: string, nestingDepth: number, array: string[]}) => {
    return (
        <>
            <Text><Tab count={3}/>{label}: {array.map((val, index) => {
                let str = val
                if (index !== (array.length - 1)){
                    str += `, `
                }
                return str
            })}</Text>
        </>
    )
}