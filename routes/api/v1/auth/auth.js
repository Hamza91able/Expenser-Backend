"use strict";

const {
  registerUser,
  loginUser,
  recoverPassword,
  verifyRecoverCode,
  resetPassword,
  _updatePassword,
} = require("../../../../controllers/auth");

module.exports = async function (fastify, opts) {
  fastify.post("/user/register", registerUser);
  fastify.post("/user/login", loginUser);
  fastify.post("/user/recover", recoverPassword);
  fastify.post("/user/verify", verifyRecoverCode);
  fastify.post("/user/reset", resetPassword);
  fastify.post(
    "/user/update",
    { preHandler: [fastify.authenticate] },
    _updatePassword
  );
};
