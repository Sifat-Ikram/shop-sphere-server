const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  validity: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Offer", offerSchema, "offer");
