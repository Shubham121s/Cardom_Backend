const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testDriveSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true,
  },
  car: {
    type: Schema.Types.ObjectId,
    ref:"Cars",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TestDrive = mongoose.model("TestDrive", testDriveSchema);

module.exports = TestDrive;
