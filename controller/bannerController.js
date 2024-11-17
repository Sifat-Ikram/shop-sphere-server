const Banner = require('../model/banner');
const mongoose = require('mongoose');

// Get all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new banner
const createNewBanner = async (req, res) => {
  const banner = new Banner(req.body);
  try {
    const newBanner = await banner.save();
    res.status(201).json(newBanner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a banner by ID
const deleteBannerById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    
    const result = await Banner.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllBanners,
  createNewBanner,
  deleteBannerById,
};
