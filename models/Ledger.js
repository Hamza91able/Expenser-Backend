const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const ledgerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    ledger_type: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ledgerSchema.plugin(mongoosePaginate);
ledgerSchema.index({ "$**": "text" });

module.exports = mongoose.model("Ledger", ledgerSchema);
