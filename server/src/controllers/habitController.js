const asyncHandler = require("express-async-handler");

const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const User = require("../models/User");
const sendResponse = require("../utils/apiResponse");
const { applyLevelProgress, calculateLevelFromXp } = require("../services/levelService");
const { checkAndUnlockAchievements } = require ("../services/achievementService");

const rewardMap ={
    easy:{xp: 15, coins: 10},
    medium:{xp: 25, coins: 20},
    hard:{xp: 40, coins: 25},
};

const startOfUtcDay = (date = new Date()) => {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
};

const calculateStreak = (habit) =>{
    if(!habit.lastCompletedAt)
        return 1;

    const today = startOfUtcDay();
    const lastCompletedDay = startOfUtcDay(habit.lastCompletedAt);
    const diffrenenceInDays = (today.getTime() - lastCompletedDay.getTime()) / 86400000;

    if (diffrenenceInDays === 1) {
        return habit.currentStreak + 1;
    }

    if (diffrenenceInDays === 0) {
        return habit.currentStreak;
    }
    return 1;
};

const createHabit= asyncHandler(async(req, res) =>{
    const {title, description, category, difficulty, frequency, targetDays, timeOfDay, color, icon, reminderEnabled, reminderTime,} = req.body;

    if(!title || !title.trim()){
        res.status(400);
        throw new Error("Habit title is required..");
    }
    const selectedDifficulty = difficulty || "easy";
    const reward = rewardMap[selectedDifficulty];

    if(!reward){
        res.status(400);
        throw new Error("Difficulty must be Easy, Medium, Hard..");
    }

    const habit = await Habit.create({
        user: req.user._id,
        title,
        description,
        category, 
        difficulty: selectedDifficulty,
        frequency,
        targetDays,
        timeOfDay,
        color,
        icon,
        reminderEnabled,
        reminderTime,
        xpReward: reward.xp,
        coinReward : reward.coins,
    });
    sendResponse(res, 201,"Habit Created successfully", { habit });
});
const getHabits = asyncHandler(async(req, res) =>{
    const habits = await Habit.find({
        user: req.user._id,
        isActive: true,
    }).sort({createdAt: -1});

    sendResponse(res, 200, "Habits Fetched successfully..", {
        count: habits.length,
        habits,
    });
});

const getHabitById = asyncHandler(async (req, res) =>{
    const habit = await Habit.findOne({
        _id:req.params.id,
        user: req.user._id,
    });

    if(!habit){
        res.status(404);
        throw new Error("Habit not found..");
    }

    sendResponse(res, 200, "Habit Fetched successfully", {habit});
});

const updateHabit = asyncHandler (async (req, res) =>{
    const habit = await Habit.findOne({
        _id: req.params.id,
        user: req.user._id,
        isActive: true,
    });

    if(!habit){
        res.status(404);
        throw new Error("Habit not found..");
    }

    const allowedFields =[
        "title", 
        "description",
        "category",
        "frequency",
        "targetDays",
        "timeOfDay",
        "color",
        "icon",
        "reminderEnabled",
        'reminderTime',
    ];
    
    allowedFields.forEach((field) =>{
        if(req.body[field] !== undefined){
            habit[field] = req.body[field];
        }
    });
    if(req.body.difficulty !== undefined){
        const reward = rewardMap[req.body.difficulty];

        if(!reward){
            res.status(400);
            throw new Error ("Difficulty must be easy, medium, or hard");
        }

        habit.difficulty = req.body.difficulty;
        habit.xpReward = reward.xp;
        habit.coinReward = reward.coins;
    }

    await habit.save();

    sendResponse(res, 200,"Habit Updated Successfully", {habit});
});

const archiveHabit = asyncHandler(async(req, res) =>{
    const habit = await Habit.findOne({
        _id: req.params.id,
        user: req.user._id,
        isActive: true,
    });

    if(!habit){
        res.status(404);
        throw new Error("Habit not Found..");
    }

    habit.isActive = false;
    habit.archivedAt = new Date();
    await habit.save();

    sendResponse(res, 200, "Habit archived Successfully");
});

const completeHabit = asyncHandler(async (req, res) =>{
    const habit = await Habit.findOne({
        _id: req.params.id,
        user: req.user._id,
        isActive: true,

    });

    if(!habit){
        res.status(404);
        throw new Error("Habit Not found");
    }

    const today = startOfUtcDay();

    const existingLog = await HabitLog.findOne({
        user: req.user._id,
        habit: habit._id,
        date: today,
    });

    if(existingLog){
        res.status(409);
        throw new Error("This habit has already been Completed Today");
    }

    const newStreak = calculateStreak(habit);

    const log = await HabitLog.create({
        user: req.user._id,
        habit: habit._id,
        date: today,
        status: "completed",
        completedAt: new Date(),
        xpEarned: habit.xpReward,
        coinsEarned: habit.coinReward,
        notes: req.body.notes || "",
    });

    habit.currentStreak = newStreak;
    habit.longestStreak = Math.max(habit.longestStreak, newStreak);
    habit.totalCompletions += 1;
    habit.lastCompletedAt = new Date();
    await habit.save();

    const user = await User.findById(req.user._id);
    const habitLevelProgress = applyLevelProgress(user, habit.xpReward);

    user.coins += habit.coinReward;
    user.totalCompletedHabits += 1;
    user.longestStreak = Math.max(user.longestStreak, newStreak);
    user.currentStreak = newStreak;

    await user.save();

    const unlockedAchievements = await checkAndUnlockAchievements({ user });
    const finalLevelProgress = calculateLevelFromXp(user.xp);

    sendResponse(res, 200, "Habit completed successfully",{
        log,
        rewards:{
            xpEarned: habit.xpReward,
            coinsEarned: habit.coinReward,
        },
        achievementsUnlocked: unlockedAchievements,
        levelEvents: {
            habit: habitLevelProgress,
            final: finalLevelProgress,
        },
        streak: {
            current: habit.currentStreak,
            longest: habit.longestStreak,
        },
        userProgress: {
            xp: user.xp,
            coins: user.coins,
            level : user.level,
            rankTitle: user.rankTitle,
            totalCompletedHabits: user.totalCompletedHabits,
            levelProgress: finalLevelProgress,
        },
    });
});

const getHabitLogs = asyncHandler(async(req, res)=>{
    const habit = await Habit.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if(!habit){
        res.status(404);
        throw new Error("Habit not found..");
    }

    const logs = await HabitLog.find({
        user: req.user._id,
        habit: habit._id,
    }).sort({date: -1});

    sendResponse(res, 200, "Habit logs fetched successfully", {
        count: logs.length,
        logs,
    });
});

module.exports ={
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    archiveHabit,
    completeHabit,
    getHabitLogs,
};

