const mongoose = require("mongoose");

const fuelTypeSchema = new mongoose.Schema({
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "Other"],
    required: true,
    unique: true,
  },
  carModels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarModel",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FuelType = mongoose.model("FuelType", fuelTypeSchema);

module.exports = FuelType;
