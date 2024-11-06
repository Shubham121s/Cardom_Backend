const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const CartItem = require("../models/cartItem");
const ErrorHandler = require("../utils/errorHandler.js");

const addItemToCart = catchAsyncErrors(async (req, res, next) => {
  const { carId, quantity, price, totalPrice } = req.body;
  const cartItem = new CartItem({
    user: req.user._id,
    car: carId,
    quantity,
    price,
    totalPrice,
  });
  await cartItem.save();
  res.status(201).json(cartItem);
});

const getItemToCart = catchAsyncErrors(async (req, res, next) => {
  const cartItems = await CartItem.find({ user: req.user._id }).populate("car");
  res.status(200).json(cartItems);
});

const deleteItemToCart = catchAsyncErrors(async (req, res, next) => {
  const item = await CartItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return next(new ErrorHandler("Item not found", 404));
  }

  res.status(200).json({ message: "Item successfully deleted", item });
});

const updateItemToCart = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const cartItem = await CartItem.findByIdAndUpdate(
    id,
    { quantity },
    { new: true }
  );
  if (!cartItem) {
    return next(new ErrorHandler("Item not found", 404));
  }
  res.json(cartItem);
});

const clearItemToCart = catchAsyncErrors(async (req, res, next) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: "Cart cleared successfully" });
});

module.exports = {
  addItemToCart,
  getItemToCart,
  deleteItemToCart,
  updateItemToCart,
  clearItemToCart,
};
