const express = require('express');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

// Configure multer for memory buffer upload to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB video file limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are supported for food reels'), false);
    }
  },
});

const router = express.Router();

// 1. Food Partner uploads a new food reel
router.post(
  '/',
  authMiddleware.authFoodPartnerMiddleware,
  upload.single('video'),
  foodController.createFood
);

// 2. Public / User feed to discover all food reels
router.get('/', authMiddleware.authUserMiddleware, foodController.viewFood);

// 3. Authenticated Food Partner views their own uploaded reels
router.get(
  '/partner/me',
  authMiddleware.authFoodPartnerMiddleware,
  foodController.getPartnerFoods
);

// 4. Authenticated Food Partner deletes their own reel
router.delete(
  '/:id',
  authMiddleware.authFoodPartnerMiddleware,
  foodController.deleteFood
);

// 5. Public route to view restaurant partner profile & all their dishes
router.get('/partner/:id', foodController.getFoodPartnerById);

// 6. User likes or unlikes a reel
router.post(
  '/:id/like',
  authMiddleware.authUserMiddleware,
  foodController.toggleLikeFood
);

module.exports = router;