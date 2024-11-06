const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "CarVariant",
      required: true,
    },
    manufacturerYear: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "Other"],
      required: true,
    },
    transmission: {
      type: String,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          default: "",
        },
      },
    ],
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    location: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postal_code: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["new", "used", "upcoming", "other"],
      default: "used",
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
    },
    rto: {
      type: Schema.Types.ObjectId,
      ref: "RTO",
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      //required: true,
    },
    specifications: {
      regNumber: {
        type: String,
      },
      engineCapacity: {
        type: String,
      },
      insurance: {
        type: {
          type: String,
        },
        validTill: {
          type: Date,
        },
      },
      spareKey: {
        type: Boolean,
        default: false,
      },
      kmDriven: {
        type: Number,
        required: true,
      },
      ownership: {
        type: String,
        enum: ["First", "Second", "Third", "Fourth", "More than Four"],
        default: "First",
        required: true,
      },
    },
    history: {
      type: [String],
      default: [],
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Cars = mongoose.model("Cars", carSchema);

module.exports = Cars;
