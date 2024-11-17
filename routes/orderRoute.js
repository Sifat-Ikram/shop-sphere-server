const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");

// POST: Create a new order
router.post("/", createOrder);

// GET: Get all orders
router.get("/", getAllOrders);

// GET: Get a specific order by ID
router.get("/:id", getOrderById);

// PUT: Update an order by ID
router.put("/:id", updateOrder);

// DELETE: Delete an order by ID
router.delete("/:id", deleteOrder);

module.exports = router;
