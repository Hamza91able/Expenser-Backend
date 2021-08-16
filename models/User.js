const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    salary: Number,
    goal: Number,
    balance: Number,
    name: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
