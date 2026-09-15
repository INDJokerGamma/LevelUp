const Achievement = require("../models/Achievement");
const { applyLevelProgress } = require("./levelService");

const achievementDefinitions = [
    {
        key: "first_habit_completed",
        title: "First Victory",
        description: "Complete your first habit.",
        category: "habits",
        rarity: "common",
        badgeIcon: "trophy",
        xpReward: 20,
        coinReward: 10,
        condition: ({ user }) => user.totalCompletedHabits >= 1,
    },
    {
        key: "five_habits_completed",
        title: "Momentum Builder",
        description: "Complete 5 habits in total.",
        category: "habits",
        rarity: "common",
        badgeIcon: "flame",
        xpReward: 40,
        coinReward: 20,
        condition: ({ user }) => user.totalCompletedHabits >= 5,
    },
    {
        key: "ten_habits_completed",
        title: "Discipline Starter",
        description: "Complete 10 habits in total.",
        category: "habits",
        rarity: "rare",
        badgeIcon: "shield",
        xpReward: 75,
        coinReward: 35,
        condition: ({ user }) => user.totalCompletedHabits >= 10,
    },
    {
        key: "three_day_streak",
        title: "Streak Spark",
        description: "Reach a 3-day streak.",
        category: "streaks",
        rarity: "common",
        badgeIcon: "zap",
        xpReward: 35,
        coinReward: 15,
        condition: ({ user }) => user.currentStreak >= 3,
    },
    {
        key: "seven_day_streak",
        title: "7-Day Streak",
        description: "Reach a 7-day streak.",
        category: "streaks",
        rarity: "rare",
        badgeIcon: "calendar-check",
        xpReward: 100,
        coinReward: 50,
        condition: ({ user }) => user.currentStreak >= 7,
    },
    {
        key: "level_5",
        title: "Disciplined",
        description: "Reach level 5.",
        category: "xp",
        rarity: "rare",
        badgeIcon: "star",
        xpReward: 150,
        coinReward: 75,
        condition: ({ user }) => user.level >= 5,
    },
];

const checkAndUnlockAchievements = async ({ user }) => {
    const existingAchievements = await Achievement.find({
        user: user._id,
    }).select("key");

    const unlockedKeys = new Set(
        existingAchievements.map((achievement) => achievement.key)
    );

    const achievementsToUnlock = achievementDefinitions.filter((achievement) => {
        return !unlockedKeys.has(achievement.key) && achievement.condition({ user });
    });

    if (achievementsToUnlock.length === 0) {
        return [];
    }

    const unlockedAchievements = await Achievement.insertMany(
        achievementsToUnlock.map((achievement) => ({
            user: user._id,
            key: achievement.key,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            rarity: achievement.rarity,
            badgeIcon: achievement.badgeIcon,
            xpReward: achievement.xpReward,
            coinReward: achievement.coinReward,
        }))
    );

    const bonusXp = unlockedAchievements.reduce(
        (total, achievement) => total + achievement.xpReward,
        0
    );

    const bonusCoins = unlockedAchievements.reduce(
        (total, achievement) => total + achievement.coinReward,
        0
    );

    if (bonusXp > 0) {
        applyLevelProgress(user, bonusXp);
    }

    user.coins += bonusCoins;
    await user.save();

    return unlockedAchievements;
};

module.exports = {
    achievementDefinitions,
    checkAndUnlockAchievements,
};