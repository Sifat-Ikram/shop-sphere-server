const Order = require("../model/order");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      email,
      username,
      order,
      discountedAmount,
      totalCost,
      deliveryDate,
      paymentStatus,
    } = req.body;

    const newOrder = new Order({
      email,
      username,
      order,
      discountedAmount,
      totalCost,
      deliveryDate,
      paymentStatus,
      status: "Pending", // Default status to 'Pending'
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create order", details: error.message });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve orders", details: error.message });
  }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve the order", details: error.message });
  }
};

// Update an order by ID
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update the order", details: error.message });
  }
};

// Delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete the order", details: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
