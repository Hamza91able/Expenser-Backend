const Auth = require("../models/Auth");
const User = require("../models/User");

const {
  REGSITER_USER_SUCCESS,
  USER_LOGIN_SUCCESS,
  PASSWORD_RECOVER_EMAIL_SUCCESS,
  INVALID_EMAIL_PASSWORD,
  INVALID_EMAIL,
  RECOVER_CODE_SUCCESS,
  INVALID_RECOVER_CODE,
  PASSWORD_UPDATE_SUCCESS,
  INVALID_PASSWORD_EQUAL,
} = require("../constants");

const { generateCode } = require("../services/generate_code");
const { generateEmail } = require("../services/generate_email");
const { generateHash } = require("../services/generate_hash");
const { generateToken } = require("../services/generate_token");

const {
  findUserByEmail,
  createResetToken,
  validateCode,
  findResetCode,
  updatePassword,
  findUserById,
} = require("../queries/queries");

const {
  comparePassword,
  userExists,
  verifyPassword,
} = require("../validations");

exports.registerUser = async (req, res) => {
  try {
    const { email, password, confirm_password } = req.body;
    const email_lower = email.toLowerCase();
    if (!comparePassword(password, confirm_password))
      return res.code(400).send({ message: INVALID_PASSWORD_EQUAL });
    if (await userExists(email_lower))
      return res.code(400).send({ message: "Email Already in Use" });
    const hashed_password = await generateHash(password);
    const auth = new Auth({
      email,
      password: hashed_password,
    });
    const user = new User({
      auth: auth._id,
    });
    auth.user = user._id;
    await user.save();
    await auth.save();
    await res.code(201).send({
      message: REGSITER_USER_SUCCESS,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await Auth.findOne({ email: email.toLowerCase() }).populate(
      "user"
    );
    const is_equal = await verifyPassword(password, user.password);
    if (!user || !is_equal)
      return res.code(400).send({ message: INVALID_EMAIL_PASSWORD });
    const token = generateToken(
      email.toLowerCase(),
      user.user._id.toString(),
      process.env.USER_SECRET
    );
    await res.code(200).send({
      message: USER_LOGIN_SUCCESS,
      token,
      user: { ...user._doc, password: "" },
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: INVALID_EMAIL_PASSWORD,
    });
  }
};

exports.recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const email_lower = email.toLowerCase();
    const user = await findUserByEmail(email_lower);
    if (!user) return res.code(400).send({ message: INVALID_EMAIL });
    const code = generateCode();
    await createResetToken(email_lower, code);
    const html = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.
    \n\n Your verification code is ${code}:\n\n
    \n\n If you did not request this, please ignore this email and your password will remain unchanged.           
    </p>`;
    await generateEmail(email_lower, "Two Sisters - Password Reset", html);
    return res.code(201).send({
      message: PASSWORD_RECOVER_EMAIL_SUCCESS,
    });
  } catch (err) {
    res.code(500).send({
      message: INVALID_EMAIL,
    });
  }
};

exports.verifyRecoverCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (await validateCode(code))
      return res.code(400).send({ message: RECOVER_CODE_SUCCESS });
    else return res.code(400).send({ message: INVALID_RECOVER_CODE });
  } catch (err) {
    res.code(500).send({
      message: INVALID_RECOVER_CODE,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirm_password, code } = req.body;
    if (!comparePassword(password, confirm_password))
      return res.code(400).send({ message: INVALID_PASSWORD_EQUAL });
    const reset_code = await findResetCode(code);
    if (!reset_code)
      return res.code(400).send({ message: INVALID_RECOVER_CODE });
    const user = await findUserByEmail(reset_code.email);
    const hashed_password = await generateHash(password);
    reset_code.remove();
    await updatePassword(user.auth, { password: hashed_password });
    await res.code(201).send({
      message: PASSWORD_UPDATE_SUCCESS,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports._updatePassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    if (!comparePassword(password, confirm_password))
      return res.code(400).send({ message: INVALID_PASSWORD_EQUAL });
    const user = await findUserById(req.user.userId);
    const hashed_password = await generateHash(password);
    await updatePassword(user.auth, { password: hashed_password });
    await res.code(201).send({
      message: PASSWORD_UPDATE_SUCCESS,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};
