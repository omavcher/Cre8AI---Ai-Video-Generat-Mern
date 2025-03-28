const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const { getAICreationById , exportVideo , fetchRecentProject , pushResentVideoFeedback , getCredit , getSavedProjects} = require('../controllers/videoController');

router.post('/aicreation', protect, getAICreationById);
router.post('/export', exportVideo);
router.get('/recent/:videoId',protect, fetchRecentProject);
router.post('/feedback',protect, pushResentVideoFeedback);
router.get('/credit', protect, getCredit);
router.get('/saved-projects', protect, videoController.getSavedProjects);
router.get('/userDetails', protect, videoController.userDetails);
router.post('/savePayment', protect, videoController.savePayment);

module.exports = router;