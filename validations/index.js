const bcrypt = require("bcryptjs");

const Auth = require("../models/Auth");

exports.comparePassword = (password, confirm_password) =>
  password === confirm_password;

exports.userExists = (email) => Auth.exists({ email: email });

exports.verifyPassword = async (password_to_comapre, password_base) =>
  await bcrypt.compare(password_to_comapre, password_base);
