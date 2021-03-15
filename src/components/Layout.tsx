import React from 'react';
import { Text, Box } from 'ink';
import { AuthServer } from '../server/authServer';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';
import Divider from 'ink-divider';
import BigText from 'ink-big-text';
import { AppCache } from '../cache/appCache';

/**
 * The CLI Layout
 * 
 * This component needs to be a class simply because functional components cannot be inherited from. The only
 * places we should use functional components are for smaller pieces of the UI.
 */
export class Layout extends React.Component<
{}, 
{ 
    ngrokUrl: string, 
    errorMessage: string,
    authServer: AuthServer,
}>{
    constructor(props: any) {
        super(props)
        this.state = {
            ngrokUrl: ``,
            errorMessage: ``,
            authServer: new AuthServer({ triggerReRenderHandler: this.setNgrokUrlHandler.bind(this) }),
        }
    }

    async componentDidMount() {
        try {
            await this.state.authServer.initTunnel()
            this.state.authServer.initRoutes()
            this.state.authServer.startServer()
        } catch (e) {
            this.setState({ ...this.state, errorMessage: e.message })
        }
    }

    /**
     * Handler to set the ngrok URL
     * 
     * This handler is passed to the AuthServer so that it can pass the ngrok URL back, once it's been set. Once called,
     * this method will trigger the component to re-render so that the URL is displayed instead of "..."
     * 
     * @param param0 
     */
    setNgrokUrlHandler({ url }: { url: string }) {
        this.setState({
            ...this.state,
            ngrokUrl: url
        })
    }

    render() {
        return (
        <>
            <Gradient name="pastel">
                <BigText text="Minecraft Assets Reader" font="tiny"/>
            </Gradient>
            <Box marginLeft={1} width="50%">
                <Text>
                    This tool is meant to help Minecraft mod and modpack developers to easily-generate starter site content
                    and assist in uploading the data to a selected content provider (or the local file system). The main use
                    for this tool is to:
                </Text>
            </Box>
            <Box marginLeft={3} marginTop={1}>
                <Text>1). Import data from a given 'assets' directory</Text>
            </Box>
            <Box marginLeft={3}>
                <Text>2). Select the namespace(s) whose data you'd like to import</Text>
            </Box>
            <Box marginLeft={3} marginBottom={2}>
                <Text>3). Upload/save the imported data to a selected CMS provider/location</Text>
            </Box>
            <>{this.props.children}</>
            <Box marginTop={1}>
                <Divider title={'Tunnel Info'} dividerColor="blue" />
            </Box>
            <Box marginLeft={1} width="25%">
                <Text color="blue">
                    Below is your ngrok tunnel address - this is only used when you need to authenticate 
                    with a third party provider. It's regenerated every time you restart the app.
                </Text>
            </Box>
            <Box marginLeft={2} marginTop={1}>
                <Text color="green">
                    ngrok tunnel: {this.state.ngrokUrl ? this.state.ngrokUrl : 
                        <Text color="yellow">
                            <Text color="yellow">
                                <Spinner type="dots" />
                            </Text>
                            {' Loading'}
                        </Text>
                    }
                </Text>
            </Box>
            
            
        </>
        )
    }
}