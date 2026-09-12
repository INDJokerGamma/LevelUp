// Step 38
const express = require("express");

const {
    getGamificationSummary,
    getLevelPreview,
}= require("../controllers/gamificationController");

const{protect} = require ("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);

router.get("/summary", getGamificationSummary);
router.get("/levels", getLevelPreview);

module.exports = router;