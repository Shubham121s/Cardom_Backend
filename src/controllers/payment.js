const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const Payment = require("../models/payment");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const createPaymentOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      sellerID = "65b7d7090be4a01da386371a",
      carId = "658da0a4762c3eed45a55701",
    } = req.body;
    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: uuidv4(),
    };

    razorpayInstance.orders.create(options, async (err, order) => {
      if (!err) {
        try {
          const payment = await Payment.create({
            transactionID: order.id,
            paymentOrderId: order.id,
            amount: amount,
            currency: currency || "INR",
            carID: carId,
            buyerID: req?.user?.id || "658029e6828f61f1b3fcd6ea",
            sellerID: sellerID,
          });

          res.status(201).json({
            success: true,
            message: "Order Created",
            order_id: order.id,
            amount: amount,
            key_id: process.env.RAZORPAY_ID_KEY,
            product_name: req.body.product_name,
            description: req.body.description,
            mobile: req.body.mobile || req.user.mobile,
            name: req.body.name || req.user.name,
            email: req.body.email || req.user.email,
            paymentId: payment._id,
          });
        } catch (error) {
          console.log(error);
          return next(error);
        }
      } else {
        console.log(err);
        return next(new ErrorHandler("Something went wrong!", 400));
      }
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
});

const paymentSuccess = catchAsyncErrors(async (req, res, next) => {
  const { paymentId, razorpay_payment_id } = req.body;
  try {
    await Payment.findByIdAndUpdate(paymentId, {
      transactionID: razorpay_payment_id,
      status: "Completed",
    });

    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

const paymentFailed = catchAsyncErrors(async (req, res, next) => {
  const { paymentId } = req.body;

  try {
    await Payment.findByIdAndUpdate(paymentId, {
      status: "Failed",
    });

    res.status(400).json({
      success: false,
      message:
        "Payment failed. Please try again later or contact support for assistance.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = { createPaymentOrder, paymentSuccess, paymentFailed };
