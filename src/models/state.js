const mongoose = require("mongoose");
const stateSchema = new mongoose.Schema({
  rtoCodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RTO',
    },
  ],
  state: {
    type: String,
    enum: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
      'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
      'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
      'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
      'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Lakshadweep', 'Puducherry'
    ],
    required: true,
  },
});

const State = mongoose.model('State', stateSchema);

module.exports = State;