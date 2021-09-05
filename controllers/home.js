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
          date: { $gt: month_start, $lt: month_end },
          ledger_type: "Debit",
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
          date: { $gt: day_start, $lt: day_end },
          ledger_type: "Debit",
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
        $match: {
          user: mongo.ObjectId(req.user.userId),
          ledger_type: "Debit",
        },
      },
      {
        $addFields: {
          date: {
            $month: "$date",
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
    let counter = 0;
    const data = await Ledger.aggregate(query);
    let avg = 0;
    const month = new Date().getMonth() + 1;
    const remaining_months = 12 - month;
    const money = user.salary * remaining_months - avg * remaining_months;
    let is_achivable;
    if (money >= user.goal) is_achivable = true;
    else is_achivable = false;
    data.forEach((data) => {
      if (data) arr[data.month - 1] = data.count;
      if (data.count > 0) {
        avg = avg + data.count;
        counter += 1;
      }
    });
    avg = avg / counter;
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

exports.getAvgIncome = async (req, res) => {
  try {
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const query = [
      {
        $match: {
          user: mongo.ObjectId(req.user.userId),
        },
      },
      {
        $addFields: {
          date: {
            $month: "$date",
          },
        },
      },
      {
        $group: {
          _id: "$date",
          credit: {
            $sum: {
              $cond: [{ $eq: ["$ledger_type", "Credit"] }, "$price", 0],
            },
          },
          debit: {
            $sum: {
              $cond: [{ $eq: ["$ledger_type", "Debit"] }, "$price", 0],
            },
          },
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
          debit: 1,
          credit: 1,
        },
      },
    ];
    const data = await Ledger.aggregate(query);
    data.forEach((data) => {
      if (data)
        arr[data.month - 1] = {
          debit: data.debit,
          credit: data.credit,
        };
    });
    await res.code(200).send({
      arr,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.dailyExpense = async (req, res) => {
  try {
    const start_date = moment(new Date())
      .startOf("month")
      .startOf("day")
      .toDate();
    const end_date = moment(new Date()).endOf("month").endOf("day").toDate();
    const days = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24));
    const days_arr = [];

    for (let i = 0; i <= days; i++) days_arr.push(i + 1);

    const expenseCount = await Ledger.aggregate([
      {
        $match: {
          user: mongo.ObjectId(req.user.userId),
          ledger_type: "Debit",
        },
      },
      {
        $group: {
          _id: {
            $add: [
              { $dayOfYear: "$date" },
              { $multiply: [400, { $year: "$date" }] },
            ],
          },
          price: { $sum: "$price" },
          first: { $min: "$date" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    await res.code(200).send({
      expenseCount: expenseCount.reverse(),
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};
