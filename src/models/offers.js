const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const offerSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Cars",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    conditions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Open", "Accepted", "Countered", "Rejected", "Expired"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offers", offerSchema);
module.exports = Offer;
