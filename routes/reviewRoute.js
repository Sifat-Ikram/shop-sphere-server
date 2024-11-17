const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  createNewReview,
  addReplyToReview,
  likeReview,
  dislikeReview,
} = require("../controller/reviewController");

// Get all reviews
router.get("/", getAllReviews);

// Create a new review
router.post("/", createNewReview);

// Add a reply to a review
router.post("/reply/:reviewId", addReplyToReview);

// Like a review
router.patch("/like/:reviewId", likeReview);

// Dislike a review
router.patch("/dislike/:reviewId", dislikeReview);

module.exports = router;