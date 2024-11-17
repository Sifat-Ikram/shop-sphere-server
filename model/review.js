const { Schema, model } = require("mongoose");

const replySchema = new Schema(
  {
    replyText: {
      type: String,
      required: true,
    },
    replyUser: {
      type: String,
      default: null, // Set to null if the user is not specified
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
); // No need for a separate _id in each reply

const reviewSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Assuming a 1-5 rating system
    },
    text: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0, // Default value for likes
    },
    dislikes: {
      type: Number,
      default: 0, // Default value for dislikes
    },
    replies: [replySchema], // Array of replies
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Review = model("Review", reviewSchema, "review");

module.exports = Review;
