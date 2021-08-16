const jwt = require("jsonwebtoken");

exports.generateToken = (email, userId, secret) =>
  jwt.sign({ email, userId }, secret);
