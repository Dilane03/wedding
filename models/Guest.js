const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  guestType: { type: String, required: true },
  partnerName: { type: String },
  numberOfGuests: { type: Number, required: true },
  password: { type: String, required: true },
  sendInvitation: { type: Boolean, default: false },
});

module.exports = mongoose.model("Guest", guestSchema);
