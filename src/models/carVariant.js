const mongoose = require("mongoose");

const carVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  features: [String],
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "Other"],
    required: true,
  },
  transmission: {
    type: String,
    required: true,
  },
  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
    required: true,
  },
  carBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarBrand",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CarVariant = mongoose.model("CarVariant", carVariantSchema);

module.exports = CarVariant;
