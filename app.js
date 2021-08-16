"use strict";

require("dotenv").config();
const publicIp = require("public-ip");
const path = require("path");
const AutoLoad = require("fastify-autoload");
const connectDB = require("./config/db");

const fastify = require("fastify")({
  logger: true,
  trustProxy: true
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins"),
});

// This loads all plugins defined in routes
// define your routes in one of these
fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
});

fastify.listen(process.env.PORT, process.env.hostname, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  connectDB();
});
