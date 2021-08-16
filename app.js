"use strict";

require("dotenv").config();
const publicIp = require("public-ip");
const path = require("path");
const AutoLoad = require("fastify-autoload");
const connectDB = require("./config/db");

const fastify = require("fastify")({
  logger: true,
  https2: true,
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins"),
});

// This loads all plugins defined in routes
// define your routes in one of these
fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
});

(async () => {
  console.log("IN HERE");
  console.log();
  const ip = await publicIp.v4();
  fastify.listen(
    process.env.PORT,
    ip || process.env.hostname,
    function (err, address) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      connectDB();
    }
  );
  //=> '46.5.21.123'

  //=> 'fe80::200:f8ff:fe21:67cf'
})();
