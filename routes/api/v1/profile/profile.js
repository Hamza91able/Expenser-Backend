"use strict";

const { me, updateProfile } = require("../../../../controllers/profile");

module.exports = async function (fastify, opts) {
  fastify.get("/user/me", { preHandler: [fastify.authenticate] }, me);
  fastify.post(
    "/user/update",
    { preHandler: [fastify.authenticate] },
    updateProfile
  );
};
