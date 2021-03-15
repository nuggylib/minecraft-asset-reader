/**
 * The OAuth redirect endpoint for Contentful
 * 
 * This endpoint is hit after the user authorizes the app with Contentful. When this endpoint is
 * hit, the user is technically authorized. However, the data for the user's session won't be present
 * in the request sent to this endpoint. Instead, the user is brought to a browser window with a URL 
 * that has the access token appended to the end of it as a hash value.
 * 
 * In order to get the access token, we have no choice but to send some code back in the response
 * that will grab the hash value from the URL and send it back to the app. This method defines the
 * code responsible for:
 * 1. Grabbing the hash value from the window location
 * 2. Cleaning the hash value so that only the access token is returned
 * 3. Closing the window after the server sends back a successful response (in response to the POST sent later)
 */
export function contentfulOauthRedirect({ ngrokUrl }: { ngrokUrl: string }) {
    return async (req: any, res: any) => {
        // TODO: intercept the hash value token - send it back to the server, save it in the server
        // see - https://stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
        var template =  
        `<script type="text/javascript">

            var http = new XMLHttpRequest();
            http.open('POST', '${ngrokUrl}/oauth/contentful', true);

            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/json');

            // Gets called when the server responds
            http.onreadystatechange = function() {
                // On successful response, close the window
                if(http.readyState == 4 && http.status == 200) {
                    window.close()
                }
            }
            http.send(JSON.stringify({
                // Clean the hash value so that only the actual token is returned
                cma_token: window.location.hash.replace('#access_token=', '').replace('&token_type=Bearer', '')
            }));
        </script>`
        res.send(template)
    }
}
    