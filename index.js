var http = require('http'),
    connect = require('connect'),
    conf = require("./config.js"),
    request = require("request"),
    bodyParser = require('body-parser');

function parseBody(body, callback) {
    let newBody
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + body.issue.key + ")",
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + body.issue.key + ")",
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
            let comment
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + body.issue.key + ")",
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
        default:
            console.log(body)
            newBody = {
                "username": "Jira",
                "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                "content": "!! Neošetřen stav: " + body.webhookEvent,
                "embeds": [{
                    // "title": body.issue.fields.description,
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + body.issue.key + ")",
                    "color": 15258703
                }]
            }
    }
    callback(newBody)
}


var app = connect()
    .use(bodyParser.json()) //json parser
    .use(bodyParser.urlencoded()) //urlencoded parser
    .use(function(req, res) {

        if (req.method == "POST") {
            parseBody(req.body, function(newBody) {
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
            })
        }
    })

http.createServer(app).listen(80, function() {
    console.log('Transfer JIRA 2 DISCORD listen 80');
});