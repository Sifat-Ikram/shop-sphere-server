const mongoose = require('mongoose');

// Define the order schema
const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  order: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      name: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      brand: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      details: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  discountedAmount: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  orderTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
});

// Create and export the model
module.exports = mongoose.model('Order', orderSchema, "order");
