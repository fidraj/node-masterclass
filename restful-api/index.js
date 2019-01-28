const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port "+config.httpPort);
});

const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem') 
};
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port "+config.httpsPort);
});

var unifiedServer = (req, res) => {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    var queryStringObject = parsedUrl.query;

    var method = req.method.toLowerCase();

    var headers = req.headers;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payload = typeof(payload) === 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            res.setHeader('Contet-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};

var router = {
    'ping': handlers.ping,
    'users': handlers.users
};