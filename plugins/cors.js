"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts, done) {
  fastify.register(require("fastify-cors"), {
    origin: "*",
    methods: "OPTIONS, GET, POST, PUT, PATCH, DELETE",
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Accept",
      "Content-Type",
      "Authorization",
    ],
  });
  done();
});
