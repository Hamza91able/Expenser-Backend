const User = require("../models/User");
const Auth = require("../models/Auth");
const Reset = require("../models/Reset");

exports.findUserByEmail = async (email) => await User.findOne({ email });

exports.findUserById = async (id) => await User.findById(id);

exports.createResetToken = async (email, code) => {
  const token = await Reset.findOne({ email });
  if (token) await token.remove();
  const newToken = new Reset({
    email,
    code,
  });
  await newToken.save();
  await User.findOneAndUpdate({ email }, { resetCode: code });
};

exports.validateCode = async (code) => await Reset.exists({ code });

exports.findResetCode = async (code) => await Reset.findOne({ code });

exports.updatePassword = async (user, updated_data) =>
  await Auth.findByIdAndUpdate(user, updated_data);
