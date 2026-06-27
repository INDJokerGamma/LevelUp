const asyncHandler = require("express-async-handler");

const Habit = require("../models/Habit");
const HabitLog = require("../models/Habitlog");
const sendResponse = require("../utils/apiResponse");

const rewardMap ={
    easy:{xp: 15, coins: 10},
    medium:{xp: 25, coins: 20},
    hard:{xp: 40, coins: 25},
};

const calculateStreak = (habit) =>{
    if(!habit.lastCompletedAt)
        return 1;

    const today = startOfUtcDay();
    const lastCompletedDay = startOFUtcDay(habit.lastCompletedAt);
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
        color,
        icon,
        reminderEnabled,
        reminderTime,
        xpReward: reward.xp,
        coinsReward : reward.coins,
    });
    sendResponse(res, 201,"Habit Created successfully", {habits});
});
const getHabits = asyncHandler(async(req, res) =>{
    const habits = await Habit.find({
        user: req.iser._id,
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
    
    
});


