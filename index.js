var express = require('express');
var conf = require("./config.js");
var session = require('express-session');
var bodyParser = require('body-parser');
var OAuth = require('oauth').OAuth;
var fs = require('fs');
var oauthToken, tokenSecret;
var app = express();

app.use(session({ secret: 'red', saveUninitialized: true, resave: true }));
app.use(bodyParser.json()); //json parser
app.use(bodyParser.urlencoded({ extended: true })); //urlencoded parser

function getIssueInfo(issueID) {
    var issue = new OAuth(
        conf.jira_project_addr + "/plugins/servlet/oauth/request-token",
        conf.jira_project_addr + "/plugins/servlet/oauth/access-token",
        conf.jira_consumer_key,
        fs.readFileSync('./jira.pem', 'utf8'), //consumer secret, eg. fs.readFileSync('jira.pem', 'utf8')
        '1.0',
        conf.jira_callback_url + "/jira/callback",
        "RSA-SHA1"
    );

    return new Promise(function(resolve, reject) {
        issue.get(conf.jira_project_addr + "/rest/api/2/issue/" + issueID,
            oauthToken, //"OAUTH_TOKEN", //authtoken
            tokenSecret, //"TOKEN_SECRET", //oauth secret

            function(error, data, resp) {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(data));
                }
            });
    });
}

function parseBody(body) {
    return new Promise(function(resolve, reject) {
        let newBody
        let comment

        switch (body.webhookEvent) {
            case 'jira:issue_created':
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "Ticket byl vytvořen",
                    "embeds": [{
                        "author": {
                            "name": body.user.displayName,
                            "icon_url": body.user.avatarUrls['48x48']
                        },
                        "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + '/browse/' + body.issue.key + ")",
                        "color": 15351320,
                        "fields": [{
                                "name": "Typ ticketu:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priorita:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            }
                        ]
                    }]
                }
                break;
            case 'jira:issue_updated':
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "Ticket byl aktualizován",
                    "embeds": [{
                        "author": {
                            "name": body.user.displayName,
                            "icon_url": body.user.avatarUrls['48x48']
                        },
                        // "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + '/browse/' + body.issue.key + ")",
                        "color": 16249146,
                        "fields": [{
                                "name": "Typ ticketu:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priorita:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            }
                        ]
                    }]
                }
                break;
            case 'comment_created':
                if (body.comment.body.length > 1000) {
                    comment = body.comment.body.substring(0, 1000) + "..."
                } else {
                    comment = body.comment.body
                }
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "Ticket byl komentován",
                    "embeds": [{
                        "author": {
                            "name": body.comment.author.displayName,
                            "icon_url": body.comment.author.avatarUrls['48x48']
                        },
                        "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + '/browse/' + body.issue.key + ")",
                        "color": 7465496,
                        "fields": [{
                                "name": "Typ ticketu:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priorita:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Komentář:",
                                "value": comment
                            }
                        ]
                    }]
                }
                break;
            case 'project_created':
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "Projekt byl vytvořen",
                    "embeds": [{
                        "author": {
                            "name": body.project.projectLead.name,
                        },
                        "title": body.project.name,
                        "color": 14498551,
                    }]
                }
                break;
            case 'worklog_created':
                if (body.worklog.comment.length > 1000) {
                    comment = body.worklog.comment.substring(0, 1000) + "..."
                } else {
                    comment = body.worklog.comment
                }
                getIssueInfo(body.worklog.issueId)
                    .then(function(resolve) {
                        let issueBody = resolve
                        newBody = {
                            "username": "Jira",
                            "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                            "content": "Ticket byl aktualizován a byl nad ním vykázanej strávenej čas",
                            "embeds": [{
                                "author": {
                                    "name": body.worklog.author.displayName,
                                    "icon_url": body.worklog.author.avatarUrls['48x48']
                                },
                                "title": issueBody.fields.issuetype.description,
                                "description": "[" + issueBody.issue.key + ": " + issueBody.issue.fields.summary + "](" + conf.jira_project_addr + '/browse/' + issueBody.issue.key + ")",
                                "color": 16249146,
                                "fields": [{
                                        "name": "Typ ticketu:",
                                        "value": issueBody.issue.fields.issuetype.name,
                                        "inline": true
                                    },
                                    {
                                        "name": "Priorita:",
                                        "value": issueBody.issue.fields.priority.name,
                                        "inline": true
                                    },
                                    {
                                        "name": "Komentář:",
                                        "value": comment
                                    }
                                ]
                            }]
                        }
                    }, function(err) {
                        reject(err);
                    })
                    .catch(function(err) {
                        reject(err)
                    })
                break;
            default:
                console.log(body)
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "!! Neošetřen stav: " + body.webhookEvent,
                    "embeds": [{
                        // "title": body.issue.fields.description,
                        // "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "]",
                        "color": 15258703
                    }]
                }
        }
        resolve(newBody);
    });
}

app.get('/jira', function(req, res) {
    var oa = new OAuth(conf.jira_project_addr + "/plugins/servlet/oauth/request-token", //request token
        conf.jira_project_addr + "/plugins/servlet/oauth/access-token", //access token
        conf.jira_consumer_key, //consumer key 
        fs.readFileSync('./jira.pem', 'utf8'), //consumer secret, eg. fs.readFileSync('jira.pem', 'utf8')
        '1.0', //OAuth version
        conf.jira_callback_url + "/jira/callback", //callback url
        "RSA-SHA1");
    oa.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret) {
        if (error) {
            console.log('Error:', error);
            res.send('STEP 1: Error requesting OAuth access token');
        } else {
            req.session.oa = oa;
            req.session.oauth_token = oauthToken;
            req.session.oauth_token_secret = oauthTokenSecret;
            return res.redirect(conf.jira_project_addr + "/plugins/servlet/oauth/authorize?oauth_token=" + oauthToken);
        }
    });
});

app.get('/jira/callback', function(req, res) {
    if (req.query.oauth_verifier === 'denied') {
        console.log('Error:', { 'oauth_verifier': 'denied' })
        return res.send('STEP 2: Error authorizing OAuth access token')
    }
    var oa = new OAuth(req.session.oa._requestUrl,
        req.session.oa._accessUrl,
        req.session.oa._consumerKey,
        fs.readFileSync('./jira.pem', 'utf8'), //consumer secret, eg. fs.readFileSync('jira.pem', 'utf8')
        req.session.oa._version,
        req.session.oa._authorize_callback,
        req.session.oa._signatureMethod);
    console.log(oa);

    oa.getOAuthAccessToken(
        req.session.oauth_token,
        req.session.oauth_token_secret,
        req.query.oauth_verifier,
        function(error, oauth_access_token, oauth_access_token_secret, results2) {
            if (error) {
                console.log('Error:', error);
                res.send('STEP 3: Error accessing OAuth access token');
            } else {
                // store the access token in the session
                req.session.oauth_access_token = oauth_access_token;
                req.session.oauth_access_token_secret = oauth_access_token_secret;

                res.send({
                    message: "successfully authenticated.",
                    access_token: oauth_access_token,
                    secret: oauth_access_token_secret
                });
                oauthToken = oauth_access_token;
                tokenSecret = oauth_access_token_secret;
            }
        });
});

app.get('/', function(req, res) {
    res.send("This is JIRA 2 DISCORD plugin. For get accesstoken call firt <YOUR_URL>/jira !");
});

app.post('/', function(req, res) {
    parseBody(req.body).then(function(newBody) {
        var options = {
            method: 'POST',
            url: conf.discord_channel_addr,
            headers: { 'Content-Type': 'application/json' },
            body: newBody,
            json: true
        };

        request(options, function(error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
        });
    }, function(err) {
        console.log(err)
    })
})

app.listen(80, function() {
    console.log('Transfer JIRA 2 DISCORD listen 80');
});