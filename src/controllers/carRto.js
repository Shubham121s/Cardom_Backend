const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const RTO = require("../models/rto");
const State = require("../models/state");

const createRTO = catchAsyncErrors(async (req, res, next) => {
  try {
    const { code, city, state } = req.body;
    const newRTO = await RTO.create({
      code,
      city,
      state,
    });

    res.status(200).json({
      success: true,
      message: "RTO created successfully",
      data: newRTO,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const updateRTO = catchAsyncErrors(async (req, res, next) => {
  try {
    const { code, city } = req.body;
    const rtoId = req.params.id;

    const rto = await RTO.findByIdAndUpdate(
      rtoId,
      {
        code,
        city,
      },
      {
        new: true,
      }
    );
    if (!rto) {
      return next(new ErrorHandler("RTO not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "RTO updated successfully",
      data: rto,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const deleteRTO = catchAsyncErrors(async (req, res, next) => {
  try {
    const rtoId = req.params.id;

    const rto = await RTO.findById(rtoId);
    if (!rto) {
      return next(new ErrorHandler("RTO not found", 404));
    }

    await State.findByIdAndUpdate(
      rto.state,
      { $pull: { rtoCodes: rtoId } },
      { new: true }
    );

    const deleteData = await RTO.findByIdAndDelete(rtoId);

    res.status(200).json({
      success: true,
      message: "RTO deleted successfully",
      data: deleteData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const getRTOByState = catchAsyncErrors(async (req, res, next) => {
  try {
    const { state } = req.query;
    filterQuery = {
      state: state,
    };

    if (req.query.keyword) {
      filterQuery.code = { $regex: req.query.keyword, $options: "i" };
    }

    const rto = await RTO.find(filterQuery);

    res.status(200).json({ success: true, data: rto });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = {
  createRTO,
  updateRTO,
  deleteRTO,
  getRTOByState,
};
