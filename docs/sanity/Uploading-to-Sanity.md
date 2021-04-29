# Uploading site data to Sanity

In the export modal of the webapp, you will have the option to toggle between `fs` and `sanity`. When Sanity is selected, you'll need to provide the following:

1. Project name
2. Auth token

> As of now, there is no support for importing data into a pre-existing Sanity project; that is in the works!

Once you click "Export", the webapp fires a request to the CLI server backend, which does the following:

1. Creates your new Sanity project
2. Bootstraps Sanity studio _document_ data
3. Bootstraps Sanity studio _asset_ data
   - Sanity assets API doesn't appear to accept `base64` encoded images; seems to (generally) expect a binary representation of the data

Once the export is complete, you should be able to start moderating your site content through the Sanity studio! To do this:

1. [Install the Sanity CLI](https://www.sanity.io/docs/getting-started-with-sanity-cli#ebd533aa3d4d) if you haven't already
2. Run `sanity init` > sign in
3. Select the project that was just created
