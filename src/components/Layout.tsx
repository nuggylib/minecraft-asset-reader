import React from "react"
import { Text, Box } from "ink"
import Gradient from "ink-gradient"
import BigText from "ink-big-text"
import { NumberedList } from "./shared/NumberedList"

export const Layout = (props: any) => (
  // const ngrokUrl = useNgrokTunnel()

  <>
    <Box marginTop={2} marginBottom={2} width="25%" marginLeft={2}>
      <Text color="yellowBright">
        ALERT: Minecraft Asset Reader is currently in alpha; there are many
        issues, known and unknown, that we have yet to address. Keep an eye out
        for updates! We will remove this message once the application is in a
        more stable state.
      </Text>
    </Box>
    <Gradient name="pastel">
      <BigText text="Minecraft Asset Reader" font="tiny" />
    </Gradient>
    <Box marginLeft={1} width="50%" marginBottom={1} marginTop={1}>
      <Text>
        Welcome to the Minecraft Asset Reader! This will help you generate site
        content based on any given version of Minecraft (modded, vanilla, or
        even a modpack). To use this:
      </Text>
    </Box>
    <NumberedList
      items={[
        {
          text: `(If you haven't already) Create your site's Sanity project using the Minecraft Blog Starter template`,
          subItems: {
            a: `Starter template address: https://www.sanity.io/create?template=nuggylib/sanity-template-minecraft-blog`,
            b: `You need a GitHub, Sanity and Netlify account to use the starter template`,
          },
        },
        {
          text: `Specify or select the location to use as the root assets directory`,
          subItems: {
            a: `The option to select a default location will only show if you have Minecraft - Java installed on your system`,
          },
        },
        {
          text: `Select 'Open webapp' and select/configure the content you would like to export to your Sanity project`,
        },
        {
          text: `Once done configuring, open the side menu in the webapp and select 'Export'`,
          subItems: {
            a: `Provide your Sanity project's Project ID and dataset (these two can be found in your Sanity studio) and auth token`,
            b: `The auth token is obtained with the Sanity CLI - run 'sanity debug --secrets' to get it`,
          },
        },
      ]}
    />
    <>{props.children}</>
  </>
)
