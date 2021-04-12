import React from "react"
import { useNgrokTunnel } from "../hooks/useNgrokTunnel"
import { Text, Box } from "ink"
import Spinner from "ink-spinner"
import Gradient from "ink-gradient"
import Divider from "ink-divider"
import BigText from "ink-big-text"

export const Layout = (props: any) => (
  // const ngrokUrl = useNgrokTunnel()

  <>
    <Gradient name="pastel">
      <BigText text="Minecraft Assets Reader" font="tiny" />
    </Gradient>
    <Box marginLeft={1} width="50%">
      <Text>
        This tool is meant to help Minecraft mod and modpack developers to
        easily-generate starter site content and assist in uploading the data to
        a selected content provider (or the local file system). The main use for
        this tool is to:
      </Text>
    </Box>
    <Box marginLeft={3} marginTop={1}>
      <Text>1). Import data from a given 'assets' directory</Text>
    </Box>
    <Box marginLeft={3}>
      <Text>2). Select the namespace(s) whose data you'd like to import</Text>
    </Box>
    <Box marginLeft={3} marginBottom={2}>
      <Text>
        3). Upload/save the imported data to a selected CMS provider/location
      </Text>
    </Box>
    <>{props.children}</>
  </>
)
