const express = require("express");

const {
    getQuests,
    getDailyQuests,
    getWeeklyQuests,
    claimQuest,
} = require("../controllers/questController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getQuests);
router.get("/daily", getDailyQuests);
router.get("/weekly", getWeeklyQuests);
router.post("/:id/claim", claimQuest);

module.exports = router;