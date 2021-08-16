const bcrypt = require("bcryptjs");

exports.generateHash = async (string) => await bcrypt.hash(string, 12);
