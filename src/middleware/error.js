const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";
  //wrong mongoose object id error'
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //duplicate key error
  if (err.code === 11000) {
    const message = `This ${Object.keys(
      err.keyValue
    )} is already registered with an account please login or use another ${Object.keys(
      err.keyValue
    )}`;
    err = new ErrorHandler(message, 400);
  }

  //validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.path);
    const message = `Validation failed. Please provide values for the following required fields: ${errors.join(", ")}`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = "Your url is invalid. Try again!!!";
    err = new ErrorHandler(message, 400);
  }
  //token expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your url is expired, Please Try Again ";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
