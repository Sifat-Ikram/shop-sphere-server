const { Schema, model } = require('mongoose');

const bannerSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Banner = model('Banner', bannerSchema, "banner");

module.exports = Banner;