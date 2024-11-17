const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const {
  getAllUsers,
  createNewUser,
  getUserById,
  checkAdminStatus,
  makeUserAdmin,
  updateUserById,
  deleteUserById,
} = require("../controller/userController");

// Get all users
router.get("/", getAllUsers);

// Create a new user
router.post("/", verifyToken, createNewUser);

// Check admin status
router.get("/admin/:email", verifyToken, checkAdminStatus);

// Make user an admin (PATCH)
router.patch("/make-admin/:id", verifyToken, verifyAdmin, makeUserAdmin);

// Update user by ID
router.patch("/:id", verifyToken, updateUserById);

// Delete user by ID
router.delete("/:id", verifyToken, deleteUserById);

module.exports = router;
