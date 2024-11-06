const mongoose = require("mongoose");

const rtoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true,
  },
});

rtoSchema.pre("save", async function (next) {
  try {
    if (this.state) {
      await mongoose.model("State").findByIdAndUpdate(this.state, {
        $addToSet: { rtoCodes: this._id },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});


const RTO = mongoose.model('RTO', rtoSchema);

module.exports = RTO;
