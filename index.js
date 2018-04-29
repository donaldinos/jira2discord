var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        console.log("--------------")
        console.log(body);
        console.log("--------------")
        res.end('ok');
        proxy.web(req, res, { changeOrigin: true, target: 'https://discordapp.com/api/webhooks/439067758739587073/ha9l-06jomi48CxNVGz1r3up3V2ZZFPH-StZJ49x84Fkhokkqe7z_Wm4f8hznV9280qn' });
    });
});

console.log("listening on port 80")
server.listen(80);




// var express = require('express');
// var proxy = require('http-proxy-middleware');
// // var bodyParser = require('body-parser');
// var router = express.Router();

// // proxy middleware options
// var proxy_options = {
//     target: 'https://discordapp.com/api/webhooks/439067758739587073/ha9l-06jomi48CxNVGz1r3up3V2ZZFPH-StZJ49x84Fkhokkqe7z_Wm4f8hznV9280qn', // target host
//     // changeOrigin: true,
//     logLevel: 'debug',
//     onError(err, req, res) {
//         res.writeHead(500, {
//             'Content-Type': 'text/plain'
//         });
//         res.end('Something went wrong.' + err);
//     },
//     onProxyReq(proxyReq, req, res) {
//         if (req.method == "POST" && req.jsonBody) {
//             let origiBody = req.jsonBody

//             console.log("--------------")
//             console.log(origiBody)

//             let newBody
//             switch (origiBody.webhookEvent) {
//                 case 'jira:issue_created':
//                     newBody = {
//                         "username": "Jira",
//                         "avatar_url": "https://i.imgur.com/mdp3NY3.png",
//                         "content": "Ticket byl vytvořen",
//                         "embeds": [{
//                             "author": {
//                                 "name": origiBody.user.displayName,
//                                 "icon_url": origiBody.user.avatarUrls['48x48']
//                             },
//                             "title": origiBody.issue.fields.description,
//                             "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
//                             "color": 15351320,
//                             "fields": [{
//                                     "name": "Typ ticketu:",
//                                     "value": origiBody.issue.fields.issuetype.name,
//                                     "inline": true
//                                 },
//                                 {
//                                     "name": "Priorita:",
//                                     "value": origiBody.issue.fields.priority.name,
//                                     "inline": true
//                                 }
//                             ]
//                         }]
//                     }
//                     break;
//                 case 'jira:issue_updated':
//                     newBody = {
//                         "username": "Jira",
//                         "avatar_url": "https://i.imgur.com/mdp3NY3.png",
//                         "content": "Ticket byl aktualizován",
//                         "embeds": [{
//                             "author": {
//                                 "name": origiBody.user.displayName,
//                                 "icon_url": origiBody.user.avatarUrls['48x48']
//                             },
//                             // "title": origiBody.issue.fields.description,
//                             "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
//                             "color": 16249146,
//                             "fields": [{
//                                     "name": "Typ ticketu:",
//                                     "value": origiBody.issue.fields.issuetype.name,
//                                     "inline": true
//                                 },
//                                 {
//                                     "name": "Priorita:",
//                                     "value": origiBody.issue.fields.priority.name,
//                                     "inline": true
//                                 }
//                             ]
//                         }]
//                     }
//                     break;
//                 case 'comment_created':
//                     let comment
//                     if (origiBody.comment.body.length > 1000) {
//                         comment = origiBody.comment.body.substring(0, 1000) + "..."
//                     } else {
//                         comment = origiBody.comment.body
//                     }
//                     newBody = {
//                         "username": "Jira",
//                         "avatar_url": "https://i.imgur.com/mdp3NY3.png",
//                         "content": "Ticket byl komentován",
//                         "embeds": [{
//                             "author": {
//                                 "name": origiBody.comment.author.displayName,
//                                 "icon_url": origiBody.comment.author.avatarUrls['48x48']
//                             },
//                             "title": origiBody.issue.fields.description,
//                             "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
//                             "color": 7465496,
//                             "fields": [{
//                                     "name": "Typ ticketu:",
//                                     "value": origiBody.issue.fields.issuetype.name,
//                                     "inline": true
//                                 },
//                                 {
//                                     "name": "Priorita:",
//                                     "value": origiBody.issue.fields.priority.name,
//                                     "inline": true
//                                 },
//                                 {
//                                     "name": "Komentář:",
//                                     "value": comment
//                                 }
//                             ]
//                         }]
//                     }
//                     break;
//                 default:
//                     newBody = {
//                         "username": "Jira",
//                         "avatar_url": "https://i.imgur.com/mdp3NY3.png",
//                         "content": "!! Neošetřen stav: " + origiBody.webhookEvent,
//                         "embeds": [{
//                             // "title": origiBody.issue.fields.description,
//                             "description": "[" + origiBody.issue.key + ": " + origiBody.issue.fields.summary + "](https://myocto.atlassian.net/browse/" + origiBody.issue.key + ")",
//                             "color": 15258703
//                         }]
//                     }
//             }

//             console.log("--------------")

//             // Remove body-parser body object from the request
//             if (req.jsonBody) delete req.jsonBody;

//             // Update header
//             //proxyReq.setHeader('content-type', 'application/json');
//             // proxyReq.setHeader('content-length', body.length);

//             // Write out body changes to the proxyReq stream
//             proxyReq.write(JSON.stringify(newBody));
//             proxyReq.end();
//         }
//     }
// };

// // create the proxy (without context)
// var proxy = proxy(proxy_options);

// var app = express();
// // app.use(bodyParser.urlencoded({ extended: false }));
// // app.use(bodyParser.json());

// app.use(function(req, res, next) {
//     var data = "";
//     req.on('data', function(chunk) { data += chunk })
//     req.on('end', function() {
//         req.jsonBody = JSON.parse(data);
//         next();
//     })
// })

// app.use('/', proxy);

// app.listen(80, '0.0.0.0', () => console.log("Bezi na: http://0.0.0.0:80"))