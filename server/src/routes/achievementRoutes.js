const express = require ("express");

const {
    getAchievements,
    checkAchievements,
} = require("../controllers/achievementController");

const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.get("/", getAchievements);
router.post("/check", checkAchievements);

module.exports = router;