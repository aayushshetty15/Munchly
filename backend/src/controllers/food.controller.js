const foodModel = require('../models/food.model');
const foodPartnerModel = require('../models/foodPartner.model');
const storageService = require('../services/storage.service');
const { v4: uuid } = require('uuid');

// Food partner uploads a reel
async function createFood(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Food video reel file is required." });
    }

    const { name, description, price, cuisine } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Dish title is required." });
    }

    // Validate video mime type
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ message: "Uploaded file must be a valid video." });
    }

    // Upload to ImageKit
    const fileUploadResult = await storageService.uploadFile(
      req.file.buffer,
      `reel_${uuid()}`
    );

    const foodItem = await foodModel.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: price ? Number(price) : 0,
      cuisine: cuisine ? cuisine.trim() : 'Chef Special',
      video: fileUploadResult.url,
      foodPartner: req.foodPartner._id,
      likes: [],
    });

    const populatedFood = await foodModel
      .findById(foodItem._id)
      .populate('foodPartner', 'name contactName phone address email profileImage cuisineType');

    res.status(201).json({
      message: "Food reel uploaded successfully",
      food: populatedFood,
    });
  } catch (error) {
    console.error("Create food reel error:", error);
    res.status(500).json({
      message: error.message || "Failed to upload food reel",
    });
  }
}

// Public/User feed of all reels
async function viewFood(req, res) {
  try {
    const foodItems = await foodModel
      .find({})
      .populate('foodPartner', 'name contactName phone address email profileImage cuisineType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Food items fetched successfully",
      foodItems,
    });
  } catch (error) {
    console.error("View food error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch food items",
    });
  }
}

// Logged-in Food Partner views their own uploaded reels
async function getPartnerFoods(req, res) {
  try {
    const foodItems = await foodModel
      .find({ foodPartner: req.foodPartner._id })
      .populate('foodPartner', 'name contactName phone address email profileImage cuisineType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Partner food items fetched successfully",
      foodItems,
    });
  } catch (error) {
    console.error("Get partner foods error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch your reels",
    });
  }
}

// Food Partner deletes their own reel (strictly scoped to partner ID)
async function deleteFood(req, res) {
  try {
    const { id } = req.params;

    // Verify ownership before deleting
    const foodItem = await foodModel.findOneAndDelete({
      _id: id,
      foodPartner: req.foodPartner._id,
    });

    if (!foodItem) {
      return res.status(404).json({
        message: "Food reel not found or you are not authorized to delete it.",
      });
    }

    res.status(200).json({
      message: "Food reel deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete food reel error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete food reel",
    });
  }
}

// Public view of restaurant profile and uploaded reels
async function getFoodPartnerById(req, res) {
  try {
    const { id } = req.params;
    const partner = await foodPartnerModel
      .findById(id)
      .select('name contactName phone address email profileImage cuisineType createdAt');

    if (!partner) {
      return res.status(404).json({ message: "Restaurant partner not found." });
    }

    const foodItems = await foodModel
      .find({ foodPartner: id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      partner,
      foodItems,
    });
  } catch (error) {
    console.error("Get partner by id error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch partner details",
    });
  }
}

// Like / unlike reel (user)
async function toggleLikeFood(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const foodItem = await foodModel.findById(id);
    if (!foodItem) {
      return res.status(404).json({ message: "Food reel not found" });
    }

    const hasLiked = foodItem.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (hasLiked) {
      foodItem.likes = foodItem.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      foodItem.likes.push(userId);
    }

    await foodItem.save();

    res.status(200).json({
      message: hasLiked ? "Unliked food reel" : "Liked food reel",
      isLiked: !hasLiked,
      likesCount: foodItem.likes.length,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      message: error.message || "Failed to update like status",
    });
  }
}

module.exports = {
  createFood,
  viewFood,
  getPartnerFoods,
  deleteFood,
  getFoodPartnerById,
  toggleLikeFood,
};