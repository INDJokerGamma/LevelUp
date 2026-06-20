const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: [true, "Habit title is required"],
            trim: true,
            minlength: [2, "Title must be at least 2 characters"],
            maxlength: [80, "Title cannot exceed 80 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
            default: "",
        },

        category: {
            type: String,
            enum: [
                "fitness",
                "learning",
                "mindfulness",
                "nutrition",
                "sleep",
                "work",
                "creativity",
                "social",
                "custom",
            ],
            default: "custom",
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy",
        },

        frequency: {
            type: String,
            enum: ["daily", "weekly", "specific_days"],
            default: "daily",
        },

        targetDays: {
            type: [Number],
            default: [],
            validate: {
                validator(days) {
                    return days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
                },
                message: "Target days must be numbers from 0 to 6",
            },
        },

        timeOfDay: {
            type: String,
            enum: ["morning", "afternoon", "evening", "anytime"],
            default: "anytime",
        },

        xpReward: {
            type: Number,
            default: 10,
            min: 0,
        },

        coinReward: {
            type: Number,
            default: 5,
            min: 0,
        },

        currentStreak: {
            type: Number,
            default: 0,
            min: 0,
        },

        longestStreak: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalCompletions: {
            type: Number,
            default: 0,
            min: 0,
        },

        color: {
            type: String,
            default: "#22c55e",
        },

        icon: {
            type: String,
            default: "target",
        },

        reminderEnabled: {
            type: Boolean,
            default: false,
        },

        reminderTime: {
            type: String,
            default: "",
        },


        lastCompletedAt: {
            type: Date,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        archivedAt: {
            type: Date,
            default: null,
        },

    },
    {
        timestamps: true,
    }
    
);

habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, category: 1 });
habitSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Habit", habitSchema);