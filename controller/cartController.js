const Cart = require("../model/cart");

// Get cart items by email or admin status
const getCartItemsByQuery = async (req, res) => {
  try {
    const email = req.query.email;
    const admin = req.query.admin;
    let query = {};

    // If email is provided, filter by email; otherwise, filter by admin status
    if (email) {
      query.email = email;
    } else if (admin) {
      query.admin = admin;
    }

    const cartItems = await Cart.find(query);
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all cart items (no query)
const getAllCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add an item to the cart
const addToCart = async (req, res) => {
  const cartItem = new Cart(req.body);
  try {
    const newCartItem = await cartItem.save();
    res.status(201).json(newCartItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Remove an item from the cart by ID
const removeFromCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cartItem = await Cart.findByIdAndDelete(id);
    if (!cartItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCartItemsByQuery,
  getAllCartItems,
  addToCart,
  removeFromCart,
};
