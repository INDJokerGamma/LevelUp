const Quest = require("../models/Quest");
const { applyLevelProgress } = require("./levelService");

const startOfUtcDay = (date = new Date()) => {
    return new Date(

        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

    );
};

const endOfUtcDay = (date = new Date()) => {

    const start = startOfUtcDay(date);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

};

const addDays = (date, days) => {
    const copy = new Date(date);
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
};

const dailyQuestTemplates = [
    {
        key: "daily_complete_1",
        title: "First Step",
        description: "Complete 1 habit today.",
        type: "daily",
        difficulty: "easy",
        objectiveType: "complete_habits",
        targetValue: 1,
        rewardXp: 20,
        rewardCoins: 10,
        rewardGems: 0,

    },
    {
        key: "daily_complete_3",
        title: "Daily Momentum",
        description: "Complete 3 habits today.",
        type: "daily",
        difficulty: "medium",
        objectiveType: "complete_habits",
        targetValue: 3,
        rewardXp: 50,
        rewardCoins: 25,
        rewardGems: 0,

    },
    {
        key: "daily_earn_50_xp",
        title: "XP Hunter",
        description: "Earn 50 XP today.",
        type: "daily",
        difficulty: "medium",
        objectiveType: "earn_xp",
        targetValue: 50,
        rewardXp: 60,
        rewardCoins: 30,
        rewardGems: 1,

    },
];

const weeklyQuestTemplates = [
    {
        key: "weekly_complete_10",
        title: "Weekly Warrior",
        description: "Complete 10 habits this week.",
        type: "weekly",
        difficulty: "medium",
        objectiveType: "complete_habits",
        targetValue: 10,
        rewardXp: 150,
        rewardCoins: 75,
        rewardGems: 2,

    },
    {
        key: "weekly_earn_300_xp",
        title: "Power Grinder",
        description: "Earn 300 XP this week.",
        type: "weekly",
        difficulty: "hard",
        objectiveType: "earn_xp",
        targetValue: 300,
        rewardXp: 250,
        rewardCoins: 125,
        rewardGems: 3,

    },
];

const createQuestFromTemplate = async ({ userId, template, expiresAt }) => {

    return Quest.create({
        user: userId,
        ...template,
        expiresAt,

    });
};

const ensureDailyQuests = async (userId) => {
    const now = new Date();

    const existingDailyQuests = await Quest.find({
        user: userId,
        type: "daily",
        expiresAt: { $gte: now },
    });

    if (existingDailyQuests.length > 0) {
        return existingDailyQuests;
    }

    const expiresAt = endOfUtcDay();

    return Promise.all(
        dailyQuestTemplates.map((template) =>
            createQuestFromTemplate({ userId, template, expiresAt })
        )
    );
};

const ensureWeeklyQuests = async (userId) => {
    const now = new Date();

    const existingWeeklyQuests = await Quest.find({
        user: userId,
        type: "weekly",
        expiresAt: { $gte: now },

    });

    if (existingWeeklyQuests.length > 0) {
        return existingWeeklyQuests;
    }

    const expiresAt = addDays(endOfUtcDay(), 7);

    return Promise.all(
        weeklyQuestTemplates.map((template) =>
            createQuestFromTemplate({ userId, template, expiresAt })
        )
    );
};

const updateQuestProgress = async ({ userId, completedHabitsDelta = 0, xpDelta = 0 }) => {
    const now = new Date();

    const activeQuests = await Quest.find({
        user: userId,
        expiresAt: { $gte: now },
        isClaimed: false,

    });

    const updatedQuests = [];

    for (const quest of activeQuests) {
        if (quest.isCompleted) {
            continue;
        }

        if (quest.objectiveType === "complete_habits") {
            quest.currentProgress += completedHabitsDelta;
        }

        if (quest.objectiveType === "earn_xp") {
            quest.currentProgress += xpDelta;
        }

        if (quest.currentProgress >= quest.targetValue) {
            quest.currentProgress = quest.targetValue;
            quest.isCompleted = true;
            quest.completedAt = new Date();

        }

        await quest.save();
        updatedQuests.push(quest);
    }

    return updatedQuests;
};

const claimQuestReward = async ({ quest, user }) => {
    if (!quest.isCompleted) {
        throw new Error("Quest is not completed yet.");

    }

    if (quest.isClaimed) {
        throw new Error("Quest reward already claimed.");
    }

    const levelProgress = applyLevelProgress(user, quest.rewardXp);

    user.coins += quest.rewardCoins;
    user.gems += quest.rewardGems;

    quest.isClaimed = true;
    quest.claimedAt = new Date();

    await user.save();
    await quest.save();

    return {
        quest,
        rewards: {
            xpEarned: quest.rewardXp,
            coinsEarned: quest.rewardCoins,
            gemsEarned: quest.rewardGems,
        },
        levelProgress,
        
    };
};

module.exports = {
    ensureDailyQuests,
    ensureWeeklyQuests,
    updateQuestProgress,
    claimQuestReward,
};