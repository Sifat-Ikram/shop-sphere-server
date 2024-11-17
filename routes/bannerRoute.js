const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  createNewBanner,
  deleteBannerById,
} = require('../controller/bannerController');
const verifyAdmin = require('../middleware/verifyAdmin');

// Get all banners
router.get('/', getAllBanners);

// Create a new banner
router.post('/', createNewBanner);

// Delete a banner by ID
router.delete('/:id', verifyAdmin, deleteBannerById);

module.exports = router;