/**
 * Assists in operations necessary for exporting data to Sanity
 *
 * The Sanity CLI will not support creating custom starter templates (either with or without unattended mode
 * enabled). This is significant because it means we can't automate creating the Studio for the user before
 * populating it with data. The only way to get around this is to have the user first create their project
 * from the sanity.io/create link.
 *
 * This limitation does actually come with some benefits:
 * 1. We no longer need to concern ourselves with the "create project" logic (that API can be removed)
 * 2. We will have the project ID before we attempt to export (though we need to update in order to support this)
 *     * There is no need to query/request the project ID anymore since we aren't creating it
 *     * The project ID is required for all project-specific operations
 *
 * @see https://www.sanity.io/create?template=nuggylib/sanity-template-minecraft-blog
 */
export class SanityExportAgent {
  constructor(projectId: string) {}

  // TODO: Method to populate the studio with the data the user is exporting
}
