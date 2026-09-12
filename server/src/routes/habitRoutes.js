const express = require("express");

const {
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    archiveHabit,
    completeHabit,
    getHabitLogs,
} = require("../controllers/habitController");

const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getHabits).post(createHabit);

router.get("/:id/logs", getHabitLogs);
router.post("/:id/complete", completeHabit);

router
        .route("/:id")
        .get(getHabitById)
        .patch(updateHabit)
        .delete(archiveHabit);

module.exports = router;
