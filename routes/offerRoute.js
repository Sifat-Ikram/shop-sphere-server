const express = require("express");
const router = express.Router();
const offerController = require("../controller/offerController");

// Route to get all offers
router.get("/", offerController.getAllOffers);

// Route to get a single offer by ID
router.get("/:id", offerController.getOfferById);

// Route to create a new offer
router.post("/", offerController.createOffer);

// Route to update an offer by ID
router.put("/:id", offerController.updateOffer);

// Route to delete an offer by ID
router.delete("/:id", offerController.deleteOffer);

module.exports = router;
