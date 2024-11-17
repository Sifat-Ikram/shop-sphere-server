const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createNewCategory,
} = require("../controller/categoryController");

// Get all users
router.get("/", getAllCategories);

// Create a new user
router.post("/", createNewCategory);
module.exports = router;
