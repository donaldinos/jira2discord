var http = require('http'),
    connect = require('connect'),
    conf = require("./config.js"),
    request = require("request"),
    bodyParser = require('body-parser');

function getIssueInfo(issueID) {
    var options = {
        method: 'GET',
        url: conf.jira_project_addr + "/rest/api/2/issue/" + issueID
    };

    return new Promise(function(resolve, reject) {
        request(options, function(error, response, body) {
            if (error) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
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
                getIssueInfo(body.issueId)
                    .then(function(resolve) {
                        let issueBody = resolve
                        newBody = {
                            "username": "Jira",
                            "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                            "content": "Ticket byl aktualizován a byl nad ním vykázanej strávenej čas",
                            "embeds": [{
                                "author": {
                                    "name": body.worklog.author.name,
                                    "icon_url": body.worklog.author.avatarUrls['48x48']
                                },
                                "title": issueBody.fields.issuetype.description,
                                "description": "[" + issueBody.key + ": " + body.issue.fields.summary + "](" + conf.jira_project_addr + issueBody.key + ")",
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


var app = connect()
    .use(bodyParser.json()) //json parser
    .use(bodyParser.urlencoded()) //urlencoded parser
    .use(function(req, res) {

        if (req.method == "POST") {
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
        }
    })

http.createServer(app).listen(80, function() {
    console.log('Transfer JIRA 2 DISCORD listen 80');
});