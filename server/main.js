var http = require('http');
var urlUtil = require('url');
var queryUtil = require('querystring');
var messages = require('./messages-util');
var md5 = require('md5');
var waitingClientMessages = [];
var clients = [];
var anonymous = 0;

var server = http.createServer(function(request, response) {
    var url = urlUtil.parse(request.url);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'DELETE')
    if (request.method === 'POST') {
        if (url.pathname === '/messages')
            addnewMessage(request, response);
        else if (url.pathname === '/register') {
            register(request, response);
        } else {
            response.writeHead(405);
            response.end();
        }
    }
    if (request.method === 'GET') {
        if (url.pathname === '/Stats') {
            getStats(request, response);
        } else if (url.pathname === '/messages') {
            getnewMessages(request, response);
        } else {
            response.writeHead(405);
            response.end();
        }
    } else if (request.method === 'DELETE') {
        deletemessage(request, response);
    } else if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
    }
});

function register(request, response) {
    var requestBody = '';
    request.on('data', function(chunk) {
        requestBody += chunk.toString();
    });
    request.on('end', function() {
        var input = JSON.parse(requestBody);
        if (input.userInfo.name === 'Anonymous') {
            anonymous++;
            input.userInfo.name = "";
            input.userInfo.email = "";
        } else {
            clients.push(input.userInfo);
        }
        while (waitingClientMessages.length > 0) {
            var client = waitingClientMessages.pop();
            var res = {
                onlines: Number,
                count: Number
            };
            res.onlines = clients.length + anonymous;
            res.count = (messages.getMessages(0)).length;
            var emptyRes = [];
            var data = {
                messaages: emptyRes,
                stats: res
            };
            client.end(JSON.stringify(data));
        }

        var res = {
            userInfo: input.userInfo,
            onlines: clients.length + anonymous
        };
        response.end(JSON.stringify(res));
    });
}

function getStats(request, response) {
    var stats = {
        onlines: Number,
        count: Number
    };
    stats.onlines = clients.length + anonymous;
    msgs = messages.getMessages(0);
    stats.count = msgs.length;
    response.end(JSON.stringify(stats));
}

function getnewMessages(request, response) {

    var url = urlUtil.parse(request.url);
    var count = queryUtil.parse(url.query);
    data = messages.getMessages(count.counter);

    if (data.length !== 0) {
        var stats = {
            onlines: Number,
            count: Number
        };
        stats.onlines = clients.length + anonymous;
        stats.count = (messages.getMessages(0)).length;
        var res = {
            messages: data,
            stats: stats
        };
        response.end(JSON.stringify(res));
    } else if (waitingClientMessages.indexOf(response) == -1) {
        waitingClientMessages.push(response);
    }
}

function addnewMessage(request, response) {
    var requestBody = '';
    request.on('data', function(chunk) {
        requestBody += chunk.toString();
    });

    request.on('end', function() {
        requestBody = JSON.parse(requestBody);
        requestBody.photo = md5(requestBody.email.toLowerCase().trim());
        var id = messages.addMessage(requestBody);
        requestBody.id = id;
        response.end(JSON.stringify({
            id: id
        }));

        while (waitingClientMessages.length > 0) {
            var stats = {
                onlines: Number,
                count: Number
            };
            stats.onlines = clients.length + anonymous;
            stats.count = messages.getMessages(0);
            stats.count = stats.count.length;
            var res = {
                messages: [requestBody],
                stats: stats
            };
            var client = waitingClientMessages.pop();
            client.end(JSON.stringify(res));
        }
    });
}

function deletemessage(request, response) {
    var url = urlUtil.parse(request.url);
    var id = url.pathname.split("/");
    id = id[2];
    var deletedItem = messages.deleteMessage(id);
    response.end(JSON.stringify(deletedItem));

    while (waitingClientMessages.length > 0) {
        var stats = {
            onlines: Number,
            count: Number
        };
        stats.onlines = anonymous + clients.length;
        stats.count = (messages.getMessages(0)).length;
        var client = waitingClientMessages.pop();
        var message = [];
        res = {
            messages: message,
            stats: stats
        };
        client.end(JSON.stringify(res));
    }
}

server.listen(9000);
console.log('listening...');