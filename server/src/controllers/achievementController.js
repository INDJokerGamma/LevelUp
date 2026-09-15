const asyncHandler = require("express-async-handler");

const Achievement = require("../models/Achievement");
const sendResponse = require("../utils/apiResponse");
const {
    achievementDefinitions,
    checkAndUnlockAchievements,
} = require("../services/achievementService");

const getAchievements = asyncHandler(async (req, res) => {
    const unlockedAchievements = await Achievement.find({
        user: req.user._id,
    }).sort({ unlockedAt: -1 });

    const unlockedKeys = new Set(
        unlockedAchievements.map((achievement) => achievement.key)
    );

    const allAchievements = achievementDefinitions.map((achievement) => ({
        key: achievement.key,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        rarity: achievement.rarity,
        badgeIcon: achievement.badgeIcon,
        xpReward: achievement.xpReward,
        coinReward: achievement.coinReward,
        unlocked: unlockedKeys.has(achievement.key),
        unlockedAt:
            unlockedAchievements.find((item) => item.key === achievement.key)
                ?.unlockedAt || null,
    }));

    sendResponse(res, 200, "Achievements fetched successfully", {
        unlockedCount: unlockedAchievements.length,
        totalCount: achievementDefinitions.length,
        achievements: allAchievements,
    });
});

const checkAchievements = asyncHandler(async (req, res) => {
    const unlockedAchievements = await checkAndUnlockAchievements({
        user: req.user,
    });

    sendResponse(res, 200, "Achievements checked successfully", {
        unlockedCount: unlockedAchievements.length,
        unlockedAchievements,
    });
});

module.exports = {
    getAchievements,
    checkAchievements,
};