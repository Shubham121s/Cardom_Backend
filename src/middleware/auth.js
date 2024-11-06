const jwt = require("jsonwebtoken");
const User = require("../models/users");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SIGNING_KEY, {
    algorithms: ["HS256"],
  });

  const foundUser = await User.findById(decodeData.user.id);

  if (!foundUser) {
    return next(new ErrorHandler("Invalid token. User not found.", 401));
  }

  req.user = foundUser;
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
