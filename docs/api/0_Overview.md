# API Overview

`minecraft-asset-reader` hosts an internal API that is normally used only by the webapp. However, we realize that creativity comes from
literally anywhere. So, we figured we would standardize our internal API so that others could leverage it for projects we never even
imagined!

**Note that the CLI tool must be running in order to use these endpoints**

## High level
* Base URL: `localhost:3000`

## Resources

### Raw data endpoints
| Resource | Method | Endpoint | Parameters |
| -------- | ------ | -------- | ---------- |
| Raw Data | `GET` | `/raw-data/namespaces` |  |
| Raw block data (for namespace) | `GET` | `/raw-data/blocks` | `?namespace=`, (optional) `?block=`, (optional) `?imageScale=`  |
