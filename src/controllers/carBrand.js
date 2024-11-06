const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const CarBrand = require("../models/carBrand");
const ErrorHandler = require("../utils/errorHandler.js");

const newCarBrand = catchAsyncErrors(async (req, res, next) => {
  const { name, country, founded, logoKey, website } = req.body;
  const STORAGE_URL = process.env.STORAGE_URL;
  try {
    const carBrand = await CarBrand.create({
      name,
      country,
      founded,
      logo: {
        url: STORAGE_URL + "/" + logoKey,
        key: logoKey,
      },
      website,
    });

    res.status(200).json({
      success: true,
      message: "Successfully created",
      data: carBrand,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      const message = `A car brand with the ${duplicateKey} '${error.keyValue[duplicateKey]}' already exists.`;
      error = new ErrorHandler(message, 400);
    }
    return next(error);
  }
});

const updateCarBrand = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const { name, country, founded, logoKey, website } = req.body;

  try {
    const STORAGE_URL = process.env.STORAGE_URL;
    let logo;

    if (logoKey) {
      logo = {
        url: `${STORAGE_URL}/${logoKey}`,
        key: logoKey,
      };
    }

    const updateData = {
      name,
      country,
      founded,
      website,
    };

    if (logo) {
      updateData.logo = logo;
    }

    const carBrand = await CarBrand.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!carBrand) {
      return next(new ErrorHandler("Car brand not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Car brand updated successfully",
      data: carBrand,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      const message = `A car brand with the ${duplicateKey} '${error.keyValue[duplicateKey]}' already exists.`;
      error = new ErrorHandler(message, 400);
    }
    return next(error);
  }
});

const deleteCarBrand = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const carBrand = await CarBrand.findByIdAndDelete(id);

  if (!carBrand) {
    return next(new ErrorHandler("Car brand not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Car brand deleted successfully",
    data: carBrand,
  });
});

const getCarBrand = catchAsyncErrors(async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: "i" };
    }

    const carBrand = await CarBrand.find(filter).populate(
      "models",
      "name fuelType transmission"
    );

    res.status(200).json({
      success: true,
      data: carBrand,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = { newCarBrand, updateCarBrand, deleteCarBrand, getCarBrand };
