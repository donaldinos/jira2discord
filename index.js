var express = require('express');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var router = express.Router();

// proxy middleware options
var proxy_options = {
    target: 'https://discordapp.com/api/webhooks/439067758739587073/ha9l-06jomi48CxNVGz1r3up3V2ZZFPH-StZJ49x84Fkhokkqe7z_Wm4f8hznV9280qn', // target host
    // changeOrigin: true, // needed for virtual hosted sites
    // ws: true,                         // proxy websockets
    // pathRewrite: {
    //     '^/api/old-path': '/api/new-path', // rewrite path
    //     '^/api/remove/path': '/path' // remove base path
    // },
    // router: {
    //     // when request.headers.host == 'dev.localhost:3000',
    //     // override target 'http://www.example.org' to 'http://localhost:8000'
    //     'dev.localhost:3000': 'http://localhost:8000'
    // }
    onError(err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Something went wrong.' + err);
    },
    onProxyReq(proxyReq, req, res) {
        if (req.method == "POST" && req.body) {
            let origiBody = req.body

            console.log("--------------")
            console.log(origiBody)

            let newBody
            switch (origiBody.webhookEvent) {
                case 'jira:issue_created':
                    newBody = {
                        "username": "Jira",
                        "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                        "content": "Ticket byl vytvořen",
                        "embeds": [{
                            "author": {
                                "name": origiBody.user.displayName,
                                "icon_url": origiBody.user.avatarUrls['48x48']
                            },
                            "title": origiBody.issue.fields.description,
                            "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
                            "color": 15351320,
                            "fields": [{
                                    "name": "Typ ticketu:",
                                    "value": origiBody.issue.fields.issuetype.name,
                                    "inline": true
                                },
                                {
                                    "name": "Priorita:",
                                    "value": origiBody.issue.fields.priority.name,
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
                                "name": origiBody.user.displayName,
                                "icon_url": origiBody.user.avatarUrls['48x48']
                            },
                            // "title": origiBody.issue.fields.description,
                            "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
                            "color": 16249146,
                            "fields": [{
                                    "name": "Typ ticketu:",
                                    "value": origiBody.issue.fields.issuetype.name,
                                    "inline": true
                                },
                                {
                                    "name": "Priorita:",
                                    "value": origiBody.issue.fields.priority.name,
                                    "inline": true
                                }
                            ]
                        }]
                    }
                    break;
                case 'comment_created':
                    let comment
                    if (origiBody.comment.body.length > 1000) {
                        comment = origiBody.comment.body.substring(0, 1000) + "..."
                    } else {
                        comment = origiBody.comment.body
                    }
                    newBody = {
                        "username": "Jira",
                        "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                        "content": "Ticket byl komentován",
                        "embeds": [{
                            "author": {
                                "name": origiBody.comment.author.displayName,
                                "icon_url": origiBody.comment.author.avatarUrls['48x48']
                            },
                            "title": origiBody.issue.fields.description,
                            "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
                            "color": 7465496,
                            "fields": [{
                                    "name": "Typ ticketu:",
                                    "value": origiBody.issue.fields.issuetype.name,
                                    "inline": true
                                },
                                {
                                    "name": "Priorita:",
                                    "value": origiBody.issue.fields.priority.name,
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
                    newBody = {
                        "username": "Jira",
                        "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                        "content": "!! Neošetřen stav: " + origiBody.webhookEvent,
                        "embeds": [{
                            // "title": origiBody.issue.fields.description,
                            "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
                            "color": 15258703
                        }]
                    }
            }

            console.log("--------------")

            // Remove body-parser body object from the request
            if (req.body) delete req.body;

            // Update header
            proxyReq.setHeader('content-type', 'application/json');
            // proxyReq.setHeader('content-length', body.length);

            // Write out body changes to the proxyReq stream
            proxyReq.write(newBody);
            proxyReq.end();
        }
    }
};

// create the proxy (without context)
var proxy = proxy(proxy_options);

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* GET home page. */
router.get('/info', function(req, res, next) {
    res.render('index', { title: 'JIRA 2 Discord Webhook Proxy' });
});

router.all('/', proxy);


app.listen(80, '0.0.0.0', () => console.log("Bezi na: http://0.0.0.0:80"))