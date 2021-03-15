import { setContentfulCMAToken } from "../../../cms-client/contentful/contentful"

/**
 * This endpoint only exists so that it can accept the POST from the front end
 * 
 * This is the final step of the Contentful auth flow - technically, the user has already authorized
 * the app, but due to how Contentful sends back the token, we can't actually grab it from the
 * initial request to the redirect. Instead, after hitting the redirect, the user is navigated to 
 * a browser window where the token is appended to the URL. We grab the token from the browser window,
 * do some polishing, then send it to this endpoint, where we collect the token for later use.
 */
export function contentfulOauthCallback(req: any, res: any) {
    setContentfulCMAToken({
        token: req.body.cma_token
    }) 
    // Send back 200 to the browser session that made the request so it knows the call was successful (and can close the window)
    res.sendStatus(200)
}
