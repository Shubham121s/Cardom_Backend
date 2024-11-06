const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Cars = require("../models/cars");
const User = require("../models/users");
// const ErrorHandler = require("../utils/errorHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const bcrypt = require("bcryptjs");

const getAllUesrs = catchAsyncErrors(async (req, res, next) => {
  try {
    const query = {};
    if (req.query.userType) {
      query.role = req.query.userType;
    }
    const users = await User.find(query);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error ", error);
    return next(error);
  }
});

const deleteCarHandlerByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const carId = req.params.id;

    const car = await Cars.findOneAndDelete({ _id: carId });

    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }

    res.status(200).json({ message: "Car successfully deleted" });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      message: "User successfully deleted.",
      data: user,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const createUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, username, email, phone_number, role, password } = req.body;
  try {
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return next(new ErrorHandler("Username is already taken.", 400));

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return next(new ErrorHandler("Email is already taken.", 400));

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      phone_number,
      role,
    });

    res.status(201).json({
      success: true,
      message: "user created successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error ", error);
    return next(error);
  }
});

module.exports = {
  deleteCarHandlerByAdmin,
  getAllUesrs,
  deleteUserByAdmin,
  createUserByAdmin,
};
