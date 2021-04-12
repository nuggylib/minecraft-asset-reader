/**
 * After the user configures their content map and click "Submit", this endpoint is intended to handle
 * the submitted data by creating the content-map in the generated output
 *
 * @param req
 * @param res
 */
export function createContentMap(req: any, res: any) {
  // Send back 200 to the browser session that made the request so it knows the call was successful (and can close the window)
  res.sendStatus(200)
}
