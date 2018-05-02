var http = require('http'),
    connect = require('connect'),
    bodyParser = require('body-parser'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({});

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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + body.issue.key + ")",
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + body.issue.key + ")",
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + body.issue.key + ")",
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
                    "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + body.issue.key + ")",
                    "color": 15258703
                }]
            }
    }
    callback(newBody)
}

//restream parsed body before proxying
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    if (req.body) {
        console.log("1.1")
            // let bodyData = JSON.stringify(req.body);
            // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        console.log("1.2")
        proxyReq.write(bodyData);
        console.log("1.3")
    }
});

var app = connect()
    .use(bodyParser.json()) //json parser
    .use(bodyParser.urlencoded()) //urlencoded parser
    .use(function(req, res) {
        // modify body here,
        // req.headers.host = "www.jira.com"
        console.log("2.1")
        console.log(req.headers);
        parseBody(req.body, function(newBody) {
            console.log("2.2")
            req.body = newBody
            console.log(req.body)
            proxy.web(req, res, {
                changeOrigin: true,
                target: 'https://discordapp.com/api/webhooks/439067758739587073/ha9l-06jomi48CxNVGz1r3up3V2ZZFPH-StZJ49x84Fkhokkqe7z_Wm4f8hznV9280qn'
            }, function(err) {
                console.log("2.3")
                console.log(err)
            })
        })
    });

http.createServer(app).listen(80, function() {
    console.log('proxy listen 80');
});