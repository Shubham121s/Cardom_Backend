const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const CarModel = require("../models/carModel.js");
const CarBrand = require("../models/carBrand.js");

const createCarModel = catchAsyncErrors(async (req, res, next) => {
  const car = await CarModel.create(req.body);
  res.status(201).json({
    success: true,
    data: car,
  });
});

const getAllCarsModel = catchAsyncErrors(async (req, res, next) => {
  let filterQuery = {};

  if (req.query.brand) {
    filterQuery.carBrand = req.query.brand;
  }

  if (req.query.year) {
    filterQuery.year = { $lte: req.query.year };
  }

  if (req.query.keyword) {
    filterQuery.name = { $regex: req.query.keyword, $options: "i" };
  }

  const cars = await CarModel.find(filterQuery);

  res.status(200).json({
    success: true,
    data: cars,
  });
});

const updateCarModel = catchAsyncErrors(async (req, res, next) => {
  let carModel = await CarModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!carModel) {
    return next(new ErrorHandler("Car model not found.", 404));
  }

  res.status(200).json({
    success: true,
    message:"Car model updated successfully.",
    data: carModel,
  });
});

const deleteCarModel = catchAsyncErrors(async (req, res, next) => {
  const carModel = await CarModel.findById(req.params.id);

  if (!carModel) {
    return next(new ErrorHandler("Car model not found.", 404));
  }

  await CarBrand.findByIdAndUpdate(
    carModel.carBrand,
    { $pull: { models: req.params.id } },
    { new: true }
  );

  const deleteModel = await CarModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Car model deleted successfully.",
    data: deleteModel,
  });
});

module.exports = {
  createCarModel,
  getAllCarsModel,
  updateCarModel,
  deleteCarModel,
};
