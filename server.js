const express = require("express");
const https = require("https");
const http = require("http");

const config = require("./config.json");

const expressServer = express();

// Add request logging middleware
const logger = require("./logger");
expressServer.use(logger);

// Add proxy handler
const handler = require("./handler");
expressServer.use(handler);

const httpsOptions = require("./SNI");

let server;

if (config.enable_https) {

    // Create HTTPS server if HTTPS is enabled in config
    server = https.createServer(httpsOptions, expressServer);

    // Create redirect server for HTTP -> HTTPS
    const redirectServer = express();
    redirectServer.use((req, res, next) => {
        res.redirect("https://" + req.headers.host + req.url);
        next();
    });
    redirectServer.listen(config.http_port, () => {
        console.log("Redirecting all HTTP requests to HTTPS");
    });

} else {

    // Create HTTP server if HTTPS is disabled in config
    server = http.createServer(expressServer);
}

server.listen(config.enable_https ? config.https_port : config.http_port, () => {
    console.log("Main server is running. HTTPS: " + config.enable_https);
})