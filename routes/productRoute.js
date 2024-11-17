const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createNewProduct,
  deleteProductById,
  updateProductById,
} = require("../controller/productController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Get all banners
router.get("/", getAllProducts);

// Create a new banner
router.post("/", createNewProduct);

// Delete a banner by ID
router.delete("/:id", verifyAdmin, deleteProductById);

// Update product by ID
router.patch("/:id", verifyAdmin, updateProductById);

module.exports = router;
