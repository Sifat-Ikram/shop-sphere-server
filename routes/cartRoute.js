const express = require("express");
const {
  getCartItemsByQuery,
  getAllCartItems,
  addToCart,
  removeFromCart,
} = require("../controller/cartController");

const router = express.Router();

// Get cart items by email or admin
router.get("/", getCartItemsByQuery);

// Get all cart items
router.get("/all", getAllCartItems);

// Add an item to the cart
router.post("/", addToCart);

// Remove an item from the cart by ID
router.delete("/:id", removeFromCart);

module.exports = router;
