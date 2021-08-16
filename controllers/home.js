const moment = require("moment");
const { mongo } = require("mongoose");

const Ledger = require("../models/Ledger");
const User = require("../models/User");

exports.getCurrentMonthsExpense = async (req, res) => {
  try {
    const month_start = moment(new Date()).startOf("month").toDate();
    const month_end = moment(new Date()).endOf("month").toDate();
    const result = await Ledger.aggregate([
      {
        $match: {
          user: mongo.ObjectId(req.user.userId),
          createdAt: { $gt: month_start, $lt: month_end },
        },
      },
      {
        $group: {
          _id: null,
          price: { $sum: "$price" },
        },
      },
    ]);
    await res.code(200).send({ result });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getTodaysExpense = async (req, res) => {
  try {
    const day_start = moment(new Date()).startOf("day").toDate();
    const day_end = moment(new Date()).endOf("day").toDate();
    const result = await Ledger.aggregate([
      {
        $match: {
          user: mongo.ObjectId(req.user.userId),
          createdAt: { $gt: day_start, $lt: day_end },
        },
      },
      {
        $group: {
          _id: null,
          price: { $sum: "$price" },
        },
      },
    ]);
    await res.code(200).send({ result });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getAvgExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const query = [
      {
        $addFields: {
          date: {
            $month: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: "$price" },
        },
      },
      {
        $addFields: {
          month: "$_id",
        },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          count: 1,
        },
      },
    ];
    const data = await Ledger.aggregate(query);
    const avg = data[0].count / 12;
    const month = new Date().getMonth() + 1;
    const remaining_months = 12 - month;
    const money = user.salary * remaining_months - avg * remaining_months;
    let is_achivable;
    if (money >= user.goal) is_achivable = true;
    else is_achivable = false;
    data.forEach((data) => {
      if (data) arr[data.month - 1] = data.count;
    });
    await res.code(200).send({
      arr,
      avg: avg.toFixed(1),
      is_achivable,
      short: (user.goal - money).toFixed(1),
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};