# jira2discord
This is custom proxy for Webhooks messages from JIRA to Discord Chat

# Play with colors
Colors: https://htmlcolorcodes.com/color-picker/

Convertor HEX to DECIMAL: https://www.binaryhexconverter.com/hex-to-decimal-converter

# Call REST API request over OAuth authentification
There is link to create OAuth authentification to JIRA for get additional information about issues with REST API request https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-oauth-authentication/

This is solution for NodeJS https://devup.co/jira-rest-api-oauth-authentication-in-node-js-2f8d226a493a

# Fix issue with OAuth module
(Thnx to https://devup.co/jira-rest-api-oauth-authentication-in-node-js-2f8d226a493a)

There is still one trick about calling the GET methods with our OAuth NPM. The JIRA REST API GET methods needs the ‘content type’ to be specified which our OAuth NPM kind of ignores. So we have to customize the NPM to suit our needs.

```javascript
{ statusCode: 415, data: ‘’ }
```

This error code 415 from JIRA is a content type related error which occurs because the GET method in OAuth without any modification sends content-type as NULL. To make the GET request work, we will modify the oauth.js file in our node module. Open “/node_modules/oauth/lib/oauth.js” file and look for ‘get’ method and pass content-type “application/json” to its return function call argument. See below code for changes.

```javascript
exports.OAuth.prototype.get= function(url, oauth_token, oauth_token_secret, callback) {
return this._performSecureRequest( oauth_token, oauth_token_secret, “GET”, url, null, “”, “null”, callback );
}
```

Change this line to

```javascript
exports.OAuth.prototype.get= function(url, oauth_token, oauth_token_secret, callback) {
return this._performSecureRequest( oauth_token, oauth_token_secret, “GET”, url, null, “”, “application/json”, callback );
}
```
