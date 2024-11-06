const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const Cars = require("../models/cars");
const Offer = require("../models/offers");

const createOffer = catchAsyncErrors(async (req, res, next) => {
  const { carId, amount, conditions } = req.body;
  try {
    const existingOffer = await Offer.findOne({ carId, buyerId: req.user._id });

    if (existingOffer) {
      return next(
        new ErrorHandler("You can only create one offer per car.", 400)
      );
    }
    const newOffer = await Offer.create({
      buyerId: req.user._id,
      carId,
      amount,
      conditions,
    });
    res.status(201).json(newOffer);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const getUserCarOffer = catchAsyncErrors(async (req, res, next) => {
  try {
    const existingOffer = await Offer.findOne({
      carId: req.params.carId,
      buyerId: req.user._id,
    });

    if (!existingOffer) {
      return next(
        new ErrorHandler("No offer found for the specified car and user", 404)
      );
    }

    res.status(200).json(existingOffer);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const getCarOfferBySeller = catchAsyncErrors(async (req, res, next) => {
  try {
    const car = await Cars.findById(req.params.carId);
    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }
    if (car.sellerId.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("Permission denied. You cannot get this offer", 403)
      );
    }
    const offers = await Offer.find({ carId: req.params.carId }).populate(
      "buyerId",
      "name email phone_number"
    );
    if (offers.length === 0) {
      return next(new ErrorHandler("No offers found", 404));
    }
    res.status(200).json(offers);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const updateOfferBySeller = catchAsyncErrors(async (req, res, next) => {
  try {
    const { status, amount } = req.body;
    const car = await Cars.findById(req.body.carId);
    if (!car) {
      return next(new ErrorHandler("Car not found", 404));
    }
    if (car.sellerId.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("Permission denied. You cannot update this offer", 403)
      );
    }
    const update = await Offer.findByIdAndUpdate(
      req.params.offerId,
      {
        status,
        amount,
      },
      { new: true }
    );
    if (!update) {
      return next(new ErrorHandler("No offers found", 404));
    }
    res.status(200).json(update);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

const deleteOfferByBuyer = catchAsyncErrors(async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.offerId);

    if (!offer) {
      return next(new ErrorHandler("No offers found", 404));
    }

    if (offer.buyerId.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler(
          "Permission denied. You cannot delete this offer.",
          403
        )
      );
    }

    await Offer.findByIdAndDelete(req.params.offerId);

    res.status(200).json({ message: "Offer successfully deleted." });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = {
  createOffer,
  getUserCarOffer,
  getCarOfferBySeller,
  updateOfferBySeller,
  deleteOfferByBuyer,
};
