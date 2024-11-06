const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const TestDrive = require("../models/testDrive.js");
const mongoose = require("mongoose");

// Create a new test drive booking
const createTestDrive = catchAsyncErrors(async (req, res, next) => {
  const { car, appointmentDate, appointmentTime } = req.body;
  const existingBooking = await TestDrive.findOne({
    car,
    appointmentDate,
    appointmentTime,
  });

  if (existingBooking) {
    return next(
      new ErrorHandler("This date and time are already booked.", 400)
    );
  }

  const testDrive = new TestDrive({
    user: req.user._id,
    car,
    appointmentDate,
    appointmentTime,
  });

  await testDrive.save();
  // res.status(201).json(testDrive);
  // const testDrive = await TestDrive.create(req.body);
  res.status(201).json({
    message: "Test drive created successfully.",
    data: testDrive,
  });
});

// Get all test drive bookings
const getAllTestDrives = catchAsyncErrors(async (req, res, next) => {
  const testDrives = await TestDrive.find({ user: req.user._id }).populate({
    path: "car",
    populate: [
      {
        path: "brand",
        model: "CarBrand",
        select: "name",
      },
      {
        path: "model",
        model: "CarModel",
        select: "name",
      }
    ],
    select: "brand model",
  });
  
  res.status(200).json({
    data: testDrives,
  });
});


// Get a test drive by ID
const getTestDriveById = catchAsyncErrors(async (req, res, next) => {
  const testDrive = await TestDrive.findById(req.params.id);
  if (testDrive == null) {
    return next(new ErrorHandler("Test drive not found", 404));
  }
  res.status(200).json(testDrive);
});

// Update a test drive booking
const updateTestDrive = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { car, appointmentDate, appointmentTime } = req.body;

  try {
    const testDrive = await TestDrive.findById(id);
    if (!testDrive) {
      return next(new ErrorHandler("Test drive not found", 404));
    }

    if (testDrive.user.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler(
          "Permission denied. You cannot update this test drive.",
          403
        )
      );
    }

    // Check if there's an existing booking with the same car, date, and time
    if (
      testDrive.car.toString() !== car ||
      testDrive.appointmentDate.toISOString() !==
        new Date(appointmentDate).toISOString() ||
      testDrive.appointmentTime !== appointmentTime
    ) {
      const existingBooking = await TestDrive.findOne({
        car,
        appointmentDate,
        appointmentTime,
      });

      if (existingBooking) {
        return next(
          new ErrorHandler("This date and time are already booked.", 400)
        );
      }
    }

    testDrive.set(req.body);
    const updatedTestDrive = await testDrive.save();

    res.status(200).json(updatedTestDrive);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = updateTestDrive;

// Delete a test drive booking
const deleteTestDrive = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const testDrive = await TestDrive.findById(id);
  if (!testDrive) {
    return next(new ErrorHandler("Test drive not found", 404));
  }

  if (testDrive.user.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler(
        "Permission denied. You cannot delete this test drive.",
        403
      )
    );
  }

  const deletedDrive = await TestDrive.findByIdAndDelete(id);
  res
    .status(200)
    .json({ message: "Test drive deleted successfully", data: deletedDrive });
});

const getAllTestDrivesByAdmin = catchAsyncErrors(async (req, res, next) => {
  const testDrives = await TestDrive.find();
  res.status(200).json({
    data: testDrives,
  });
});

const updateTestDriveByAdmin = catchAsyncErrors(async (req, res, next) => {
  const updatedTestDrive = await TestDrive.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedTestDrive);
});

const deleteTestDriveByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const deleted = await TestDrive.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(new ErrorHandler("Test drive not found", 404));
    }
    res.json({ message: "Test drive deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createTestDrive,
  getAllTestDrives,
  getTestDriveById,
  updateTestDrive,
  deleteTestDrive,
  updateTestDriveByAdmin,
  deleteTestDriveByAdmin,
  getAllTestDrivesByAdmin,
};
