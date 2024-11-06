const mongoose = require("mongoose");

const carBrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    founded: {
      type: Number,
      required: true,
    },
    logo: {
      url: {
        type: String,
      },
      key: {
        type: String,
      },
    },
    website: String,
    models: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CarModel",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CarBrand = mongoose.model("CarBrand", carBrandSchema);

module.exports = CarBrand;
