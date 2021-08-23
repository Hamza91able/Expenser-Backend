const moment = require("moment");

const Ledger = require("../models/Ledger");
const User = require("../models/User");

exports.addLedger = async (req, res) => {
  let id, balance;
  try {
    const { name, price, date, note, type, remove } = req.body;
    const ledger = new Ledger({
      name,
      price,
      date: new Date(date).toUTCString(),
      note,
      ledger_type: type,
      user: req.user.userId,
    });
    await ledger.save();
    id = ledger._id;
    if (type === "Credit") {
      const user = await User.findById(req.user.userId);
      user.balance = parseFloat(user.balance) + parseFloat(price);
      balance = user.balance;
      await user.save();
    }
    if (type === "Debit" && remove) {
      const user = await User.findById(req.user.userId);
      user.balance = parseFloat(user.balance) - parseFloat(price);
      balance = user.balance;
      await user.save();
    }
    await res.code(201).send({
      message: "Ledger Saved",
      balance,
    });
  } catch (err) {
    if (id) await Ledger.findByIdAndDelete(id);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.log = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { $text: { $search: req.query.searchString } }
      : {};
    const from = req.query.from ? req.query.from : null;
    const to = req.query.to ? req.query.to : null;
    let dateFilter = {};
    if (from && to)
      dateFilter = {
        createdAt: {
          $gte: moment(new Date(from)).startOf("day"),
          $lte: moment(new Date(to)).endOf("day"),
        },
      };
    const ledger_type_filter = req.query.ledger_type
      ? {
          ledger_type: req.query.ledger_type,
        }
      : {};
    const ledger = await Ledger.paginate(
      {
        user: req.user.userId,
        ...searchParam,
        ...dateFilter,
        ...ledger_type_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        sort: "-_id",
      }
    );
    await res.code(200).send({
      ledger,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
