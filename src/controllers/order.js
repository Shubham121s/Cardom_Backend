const Order = require("../models/order");
const Product = require("../models/cars");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new order
const newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItem,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    orderItem,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    order,
  });
});

// get single order by id (admin)
const singleOrderdetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("No order Found with this id", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

// get my orders
const myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all orders and ammount
const allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmmount = 0;
  orders.forEach((order) => {
    totalAmmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    orders,
    totalAmmount,
  });
});

// update order status
const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order Found with this id", 404));
  }
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("WE have Already delivered this order", 400));
  }
  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (ele) => {
      //await updateStock(order.Product,order.quantity);
      const product = await Product.findById(ele.product);
      product.stock -= ele.quantity;
      await product.save({ validateBeforeSave: false });
    });
  }

  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Status updated!",
  });
});

// delete order admin
const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("No order Found with this id", 404));
  }
  await order.deleteOne();
  res.status(200).json({
    success: true,
    message: "order deleted successfully!",
  });
});

// const deleteOrder = catchAsyncErrors(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);
//   if (!order) {
//     return next(new ErrorHandler("No order Found with this id", 404));
//   }
//   order.remove((err, removedOrder) => {
//     if (err) {
//       return next(err);
//     }
//     res.status(200).json({
//       success: true,
//       message: "Order deleted successfully!",
//     });
//   });
// });

module.exports = {
  newOrder,
  singleOrderdetails,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
};
