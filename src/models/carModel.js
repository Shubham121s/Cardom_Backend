const mongoose = require("mongoose");

const carModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  fuelType: {
    type: [
      {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "Other"],
      },
    ],
    required: true,
  },
  transmission: {
    type: [
      {
        type: String,
        enum: ["Manual", "Automatic"],
        required: true,
      },
    ],
  },
  carBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarBrand",
    required: true,
  },
});

carModelSchema.pre("save", async function (next) {
  try {
    if (this.carBrand) {
      await mongoose.model("CarBrand").findByIdAndUpdate(this.carBrand, {
        $addToSet: { models: this._id },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const CarModel = mongoose.model("CarModel", carModelSchema);

module.exports = CarModel;
