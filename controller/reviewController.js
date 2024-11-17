const Review = require("../model/review");

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found" });
    }
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new review
const createNewReview = async (req, res) => {
  const { email, username, rating, text, productName } = req.body;

  // Basic validation
  if (!email || !username || !rating || !text || !productName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const review = new Review({
    email,
    username,
    rating,
    text,
    productName,
  });

  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a reply to a review
const addReplyToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { replyText, replyUser } = req.body;

  if (!replyText) {
    return res.status(400).json({ message: "Reply text is required" });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Add the reply to the reviews array
    review.replies.push({ replyText, replyUser });
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like a review
const likeReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Increment likes
    review.likes += 1;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dislike a review
const dislikeReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Increment dislikes
    review.dislikes += 1;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllReviews,
  createNewReview,
  addReplyToReview,
  likeReview,
  dislikeReview,
};
