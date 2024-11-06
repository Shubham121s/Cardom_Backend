const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const Payment = require("../models/payment");

// Get transaction by admin account
const getTransactionByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { search, page = 1, perPage = 10, status } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { transactionID: { $regex: new RegExp(search, "i") } },
      { paymentOrderId: { $regex: new RegExp(search, "i") } },
    ];
  }
  if (status) {
    query.status = status;
  }

  const [transactions, totalTransactions] = await Promise.all([
    Payment.find(query)
      .sort({ dateTime: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("buyerID", "name email phone_number")
      .populate("sellerID", "name email phone_number")
      .populate("carID", "brand model price"),
    Payment.countDocuments(query),
  ]);

  let totalAmount = 0;
  transactions.forEach((transaction) => {
    totalAmount += transaction.amount;
  });

  res.status(200).json({
    success: true,
    transactions,
    totalLength: totalTransactions,
    totalAmount,
  });
});

const getTransactionByUser = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, perPage = 10, status } = req.query;

  const query = { buyerID: req.user._id };

  if (status) {
    query.status = status;
  }

  const [transactions, totalTransactions] = await Promise.all([
    Payment.find(query)
      .sort({ dateTime: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("carID", "brand model price"),
    Payment.countDocuments(query),
  ]);

  let totalAmount = 0;
  transactions.forEach((transaction) => {
    totalAmount += transaction.amount;
  });

  res.status(200).json({
    success: true,
    transactions,
    totalLength: totalTransactions,
    totalAmount,
  });
});

const getTransactionBySeller = catchAsyncErrors(async (req, res, next) => {
  const { search, page = 1, perPage = 10, status } = req.query;

  const query = { sellerID: req.user.id };
  if (status) {
    query.status = status;
  }

  const [transactions, totalTransactions] = await Promise.all([
    Payment.find(query)
      .sort({ dateTime: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("buyerID", "name email phone_number")
      .populate("carID", "brand model price"),
    Payment.countDocuments(query),
  ]);

  let totalAmount = 0;
  transactions.forEach((transaction) => {
    totalAmount += transaction.amount;
  });

  res.status(200).json({
    success: true,
    transactions,
    totalLength: totalTransactions,
    totalAmount,
  });
});

module.exports = {
  getTransactionByAdmin,
  getTransactionByUser,
  getTransactionBySeller,
};
