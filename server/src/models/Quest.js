const mongoose = require ("mongoose");

const questSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,

    },
    
    key: {
        type: String,
        required: true,
        trim: true,

    },

    title: {
        type: String,
        required: true, 
        trim: true,

    },

    description: {
        type: String,
        required: true,
        trim: true,

    },

    type:{
        type: String,
        enum: ["daily", "weekly", "epic", "secret", "recovery"],
        default: "daily",
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy",
    },

    objectiveType:{
        type: String,
        enum: ["complete_habits", "earn_xp", "maintain_streak"],
        required : true,
    },

    targetValue: {
        type: Number, 
        required: true,
        min: 1,
    },

    currentProgress: {
        type: Number,
        default: 0,
        min: 0,
    },

    rewardXp: {
        type: Number,
        default: 0,
        min: 0,
    },

    rewardCoins: {
        type: Number,
        default: 0,
        min: 0,
    },

    rewardGems: {
        type: Number,
        default: 0,
        min: 0,
    },

    isCompleted: {
        type: Boolean,
        default: false,
    },

    isClaimed: {
        type: Boolean,
        default: false,
    },

    completedAt:{
        type: Date,
        default: null,
    },

    claimedAt: {
        type: Date,
        default: null,
    },

    expiresAt:{
        type: Date,
        required: true,
    },
},
    {
        timestamps: true,
    }
);

questSchema.index({user: 1, type: 1, expiresAt: 1});
questSchema.index({user: 1, key: 1, expiresAt: 1});
questSchema.index({user: 1, isCompleted: 1, isClaimed: 1});

module.exports = mongoose.model("Quest", questSchema);