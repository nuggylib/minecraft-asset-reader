import React from "react"
import SelectInput from 'ink-select-input';
import { Box, Text } from "ink";


export class Menu extends React.Component<
{
    title: string
    options: {
        label: string
        value: string
    }[]
    onSelectHandler: any
},
{}
> {

    constructor(props: any) {
        super(props)
    }

    render() {
        return (
            <>
                <Box marginLeft={1}>
                    <Text bold color="blue">{this.props.title}</Text>
                </Box>
                <SelectInput items={this.props.options} onSelect={this.props.onSelectHandler}/>
            </>
        )
    }
}
