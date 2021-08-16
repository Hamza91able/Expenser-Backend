"use strict";

const { addLedger, log } = require("../../../../controllers/ledger");

module.exports = async function (fastify, opts) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, log);
  fastify.post("/", { preHandler: [fastify.authenticate] }, addLedger);
};
