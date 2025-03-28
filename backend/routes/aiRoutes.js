const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateVideoIdeas, generateVideoStructure } = require("../controllers/aiController");

// Routes with authentication middleware
router.post("/generate-ideas", protect, generateVideoIdeas);
router.post("/generate-video", protect, generateVideoStructure);

module.exports = router;