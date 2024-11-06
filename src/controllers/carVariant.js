const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const CarVariant = require("../models/carVariant.js");
const ErrorHandler = require("../utils/errorHandler.js");

const newCarVariant = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    features,
    fuelType,
    carModel,
    transmission,
    carBrand,
  } = req.body;

  try {
    const carVariant = await CarVariant.create({
      name,
      description,
      features,
      fuelType,
      carModel,
      transmission,
      carBrand,
    });

    res.status(200).json({
      success: true,
      data: carVariant,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

const updateCarVariant = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, description, features, fuelType, transmission } = req.body;
    const id = req.params.id;

    const carVariant = await CarVariant.findByIdAndUpdate(
      id,
      {
        name,
        description,
        features,
        fuelType,
        transmission,
      },
      { new: true }
    ).populate("carModel", "name");

    if (!carVariant) {
      return next(new ErrorHandler("Car Variant not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Car variant updated successfully.",
      data: carVariant,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

const deleteCarVariant = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const carVariant = await CarVariant.findByIdAndDelete(id);

  if (!carVariant) {
    return next(new ErrorHandler("Car Variant not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Car Variant deleted successfully.",
    data: carVariant,
  });
});

const getCarVariant = catchAsyncErrors(async (req, res, next) => {
  let filterQuery = {};

  if (req.query.brand) {
    filterQuery.carBrand = req.query.brand;
  }

  if (req.query.model) {
    filterQuery.carModel = req.query.model;
  }

  if (req.query.fuelType) {
    filterQuery.fuelType = req.query.fuelType;
  }

  if (req.query.transmission) {
    filterQuery.transmission = req.query.transmission;
  }

  if (req.query.keyword) {
    filterQuery.name = { $regex: req.query.keyword, $options: "i" };
  }

  const carVariants = await CarVariant.find(filterQuery)
    .populate("carModel", "name")
    .lean();

  res.status(200).json({
    success: true,
    data: carVariants,
  });
});

module.exports = {
  newCarVariant,
  updateCarVariant,
  deleteCarVariant,
  getCarVariant,
};
