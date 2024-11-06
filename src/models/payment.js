const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionID: {
      type: String,
      required: true,
      unique: true,
    },
    paymentOrderId: {
      type: String,
    },
    dateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    carID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cars",
      required: true,
    },
    buyerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
