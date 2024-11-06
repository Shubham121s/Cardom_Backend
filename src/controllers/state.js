const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const State = require("../models/state");

const createState = catchAsyncErrors(async (req, res, next) => {
  const { state } = req.body;

  try {
    const existingState = await State.findOne({ state });
    if (existingState) {
      return next(new ErrorHandler("State already exists", 400));
    }
    const newState = new State({ state });
    await newState.save();
    res.status(200).json({
      success: true,
      message: "State created successfully",
      data: newState,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const message = error.message;
      return next(new ErrorHandler(message, 400));
    }
    next(error);
  }
});

// const updateState = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { state: newState } = req.body;
//     const stateId = req.params.id;

//     const state = await State.findById(stateId);
//     if (!state) {
//       return res.status(404).json({ message: "State not found" });
//     }

//     state.state = newState || state.state;

//     const updatedState = await state.save();

//     res
//       .status(200)
//       .json({ message: "State updated successfully", state: updatedState });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// const deleteState = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const stateId = req.params.id;

//     const state = await State.findById(stateId);
//     if (!state) {
//       return res.status(404).json({ message: "State not found" });
//     }

//     await State.findByIdAndDelete(stateId);

//     res.status(200).json({ message: "State deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

const getState = catchAsyncErrors(async (req, res, next) => {
  filterQuery = {};

  if (req.query.keyword) {
    filterQuery.state = { $regex: req.query.keyword, $options: "i" };
  }
  const state = await State.find(filterQuery).populate("rtoCodes");

  res.status(200).json({ data: state });
});

module.exports = {
  createState,
  // updateState,
  // deleteState,
  getState,
};
