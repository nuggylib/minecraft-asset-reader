import React from "react"
import SelectInput from 'ink-select-input';
import { Box, Text } from "ink";
import { Menu } from "./shared/Menu"


export class MainMenu extends React.Component<
{
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
                <Menu  title={"MENU"} options={this.props.options} onSelectHandler={this.props.onSelectHandler}/>  
            </>
        )
    }
}
