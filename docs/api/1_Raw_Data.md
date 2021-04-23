# Raw Data resource

The raw data resource is simply the data as it's stored after it's been imported. This is basically a "reflection" of the relevant data we need, as it's structured in the original `assets` directory.

In other words, this resource contains the data as it's defined "straight from the source", **with one significant exception**:
* The `textures` field is modified for every block we read in
    * This is necessary because the default key is largely meaningless
    * The default value is a relative path pointing to where the texture exists _within_ the `textures` directory (but doesn't specify the `textures` directory, explicitly)
    * We replace the default key with the value (e.g., the relative path) so we know the name of the texture it points to
        * We replace the value with a base64 encoding of the original-sized image, making it easier for a webapp to consume and display

Everything else about the stored raw data is "as-is", just pared down to the parts we need for this tool.

## `GET` - `/raw-data`

Query parameters:
* _(optional)_ `namespace`
    * If provided, will get all of the raw data for the given namespace
    * If not specified, will get ALL of the raw data

_TODO: document response shape_

## `GET` - `/raw-data/namespaces`

Returns the array of namespaces detected in the raw data.

_TODO: document response shape_
