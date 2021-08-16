const User = require("../models/User");

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("auth", "email")
      .lean();
    await res.code(200).send({
      user,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, salary, goal, balance } = req.body;
    console.log(req.body);
    const user = await User.findById(req.user.userId).populate("auth", "email");
    user.name = name;
    user.salary = salary;
    user.goal = goal;
    user.balance = balance;
    await user.save();
    await res.code(200).send({
      message: "Profile Updated",
      user,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};
