const asyncHandler = require ("express-async-handler");
const sendResponse = require("../utils/apiResponse");

const {
    calculateLevelFromXp,
    getXpRequiredForLevel,
    getRankTitle,

} = require ("../services/levelService");

const getGamificationSummary = asyncHandler(async (req, res) => {
    const levelData = calculateLevelFromXp(req.user.xp);

    sendResponse(res, 200, "Gamification summary fetched successfully", {
        user: {
            level: req.user.level,
            xp: req.user.xp,
            coins: req.user.coins,
            gems: req.user.gems,
            rankTitle : req.user.rankTitle,
            currentStreak: req.user.currentStreak,
            longestStreak: req.user.longestStreak,
            totalCompletedhabits: req.user.totalCompletedhabits,
        },

        levelProgress: {
            currentLevelXp: levelData.currentLevelXp,
            nextLevelXp: levelData.nextLevelXp,
            progressPercent: levelData.ProgressPercent,
        },

        ranks: [
            { level: 1, title: "Beginner" },
            { level: 5, title: "Disciplined" },
            { level: 10, title: "Warrior" },
            { level: 20, title: "Elite" },
            { level: 50, title: "Legend" },
            { level: 100, title: "Mythic" },
        ],
    });
});

const getLevelPreview = asyncHandler(async (req, res) =>{
    const levels = Array.from({length: 20}, (_, index) =>{
        const level = index +1;

        return {
            level, 
            xpRequired : getXpRequiredForLevel(level),
            rankTitle: getRankTitle(level),
        };
    });

    sendResponse(res, 200, "Level preview fetched successfully",{
        levels,
    });
});

module.exports = {
    getGamificationSummary,
    getLevelPreview,
};