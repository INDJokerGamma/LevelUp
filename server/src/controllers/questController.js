const asyncHandler = require("express-async-handler");

const Quest = require("../models/Quest");
const User = require("../models/User");
const sendResponse = require("../utils/apiResponse");
const {
    ensureDailyQuests,
    ensureWeeklyQuests,
    claimQuestReward,
} = require("../services/questService");

const getQuests = asyncHandler(async (req, res) => {
    await ensureDailyQuests(req.user._id);
    await ensureWeeklyQuests(req.user._id);

    const quests = await Quest.find({
        user: req.user._id,
        expiresAt: { $gte: new Date()},
    }).sort({ type: 1, difficulty: 1, createdAt: 1});

    sendResponse(res, 200, "Quests Fetched successfully", {
        count: quests.length,
        quests,
    });
});

const getDailyQuests = asyncHandler(async(req, res) => {
    const quests = await ensureDailyQuests(req.user._id);

    sendResponse(res, 200, "Daily quests fetched successfully", {
        count : quests.length,
        quests,
    });
});

const getWeeklyQuests = asyncHandler(async (req, res) => {
    const quests = await ensureWeeklyQuests(req.user._id);

    sendResponse(res, 200, "Weekly quests fetched successfully", {
        count: quests.length,
        quests,
    });
});

const claimQuest = asyncHandler(async(req, res) =>{
    const quest = await Quest.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if(!quest){
        res.status(404);
        throw new Error("Quest not found.");
    }

    const user = await User.findById(req.user._id);
    const result = await claimQuestReward({ quest, user });

    sendResponse(res, 200, "Quest Reward claimed successfully", result);

});

module.exports = {
    getQuests,
    getDailyQuests,
    getWeeklyQuests,
    claimQuest,
};
