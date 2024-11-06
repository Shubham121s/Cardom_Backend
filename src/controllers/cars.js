const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const Cars = require("../models/cars");

const createCarHandler = catchAsyncErrors(async (req, res, next) => {
  try {
    const { images } = req.body;
    const STORAGE_URL = process.env.STORAGE_URL;

    if (!STORAGE_URL) {
      console.log("STORAGE_URL is not defined");
    }

    if (!Array.isArray(images)) {
      return next(new ErrorHandler("Images should be an array", 400));
    }

    const processedImages = images.map((img) => {
      if (!img.key) {
        console.log("Each image must have a key");
      }
      return {
        url: `${STORAGE_URL}/${img.key}`,
        key: img.key,
      };
    });

    req.body.images = processedImages;
    req.body.sellerId = req.user._id;

    const car = await Cars.create(req.body);

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
});

const updateCarHandler = catchAsyncErrors(async (req, res, next) => {
  try {
    const car = await Cars.findById(req.params.id);
    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }
    if (car.sellerId.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("Permission denied. You cannot update this car.", 403)
      );
    }

    Object.assign(car, req.body);
    const updatedCar = await car.save();

    res
      .status(200)
      .json({ message: "Car successfully updated", car: updatedCar });
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

const deleteCarHandler = catchAsyncErrors(async (req, res, next) => {
  try {
    const car = await Cars.findOne({
      _id: req.params.id,
    });

    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }

    if (car.sellerId.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("Permission denied. You cannot delete this car.", 403)
      );
    }
    car.images.forEach(async (image) => {
      await r2Config.deleteObject(image.key);
    });
    await car.remove();

    res.status(200).json({ message: "Car successfully deleted" });
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

// const getCarsHandler = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const {
//       brand,
//       model,
//       condition,
//       search,
//       price,
//       kmDriven,
//       ownership,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { brand: { $regex: new RegExp(search, "i") } },
//         { model: { $regex: new RegExp(search, "i") } },
//         { description: { $regex: new RegExp(search, "i") } },
//       ];
//     }
//     if (brand) query.brand = brand;
//     if (model) query.model = model;
//     if (condition) query.condition = condition;
//     if (ownership) query["specifications.ownership"] = ownership;
//     if (price) {
//       const [minPrice, maxPrice] = price.split("-");
//       if (minPrice) query.price = { $gte: parseInt(minPrice) };
//       if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice) };
//     }
//     if (kmDriven) {
//       const [minKmDriven, maxKmDriven] = kmDriven.split("-");
//       if (minKmDriven)
//         query["specifications.kmDriven"] = { $gte: parseInt(minKmDriven) };
//       if (maxKmDriven)
//         query["specifications.kmDriven"] = {
//           ...query["specifications.kmDriven"],
//           $lte: parseInt(maxKmDriven),
//         };
//     }
//     const skip = (page - 1) * limit;

//     const [cars, totalLength] = await Promise.all([
//       Cars.find(query)
//         .skip(skip)
//         .limit(limit)
//         .populate("sellerId", "name email phone_number"),
//       Cars.countDocuments(query),
//     ]);

//     res.status(200).json({
//       totalLength: totalLength,
//       cars,
//     });
//   } catch (err) {
//     console.error(err.message);
//     return next(err);
//   }
// });

const getSingleCarHandler = catchAsyncErrors(async (req, res, next) => {
  try {
    const car = await Cars.findById(req.params.id)
      .populate("brand", "name logoUrl")
      .populate("model", "name")
      .populate("variant")
      .populate("state", "state")
      .populate("rto", "code city")
      .populate("sellerId", "name email phone_number");

    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Car details fetched successfully",
      data: car,
    });
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

const getCarsHandler = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 9 } = req.query;

  const filterQuery = {};

  if ("condition" in req.query) {
    filterQuery.condition = req.query.condition;
  }

  if ("status" in req.query) {
    filterQuery.status = req.query.status;
  }

  if ("manufacturerYear" in req.query) {
    filterQuery.manufacturerYear = req.query.manufacturerYear;
  }

  if ("ownership" in req.query) {
    filterQuery["specifications.ownership"] = req.query.ownership;
  }

  if ("price" in req.query) {
    const [minPrice, maxPrice] = req.query.price.split("-");
    if (minPrice) filterQuery.price = { $gte: parseInt(minPrice) };
    if (maxPrice)
      filterQuery.price = { ...filterQuery.price, $lte: parseInt(maxPrice) };
  }
  if ("kmDriven" in req.query) {
    const [minKmDriven, maxKmDriven] = req.query.kmDriven.split("-");
    if (minKmDriven)
      filterQuery["specifications.kmDriven"] = { $gte: parseInt(minKmDriven) };
    if (maxKmDriven)
      filterQuery["specifications.kmDriven"] = {
        ...filterQuery["specifications.kmDriven"],
        $lte: parseInt(maxKmDriven),
      };
  }

  if ("state" in req.query) {
    filterQuery.state = req.query.state;
  }

  if ("models" in req.query) {
    filterQuery.model = req.query.model;
  }

  if ("brands" in req.query) {
    filterQuery.brand = { $in: req.query.brands.split(",") };
  }

  if ("fuelTypes" in req.query) {
    filterQuery.fuelType = { $in: req.query.fuelTypes.split(",") };
  }

  if ("transmissions" in req.query) {
    filterQuery.transmission = { $in: req.query.transmissions.split(",") };
  }

  const skip = (page - 1) * limit;

  const [cars, totalLength] = await Promise.all([
    Cars.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .populate("brand", "name logoUrl")
      .populate("model", "name")
      .populate("variant")
      .populate("state", "state")
      .populate("rto", "code city")
      .populate("sellerId", "name email phone_number"),
    Cars.countDocuments(filterQuery),
  ]);

  res.status(200).json({
    success: true,
    data: { totalLength: totalLength, cars },
  });
});

const getCarBySellerHandler = catchAsyncErrors(async (req, res, next) => {
  try {
    const cars = await Cars.find({ sellerId: req.user._id })
      .populate("brand", "name logoUrl")
      .populate("model", "name")
      .populate("variant")
      .populate("state", "state")
      .populate("rto", "code city")
      .populate("sellerId", "name email phone_number");

    res.status(200).json({
      success: true,
      message: "Car details fetched successfully",
      data: cars,
    });
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

module.exports = {
  createCarHandler,
  deleteCarHandler,
  updateCarHandler,
  getCarsHandler,
  getSingleCarHandler,
  getCarBySellerHandler,
};
