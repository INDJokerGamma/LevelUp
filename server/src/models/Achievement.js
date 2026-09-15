const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
    {
        user: {
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

        category: {
            type: String,
            enum: ["habits", "streaks", "xp", "focus", "journal", "wellness", "special"],
            default: "habits",
        },

        rarity: {
            type: String,
            enum: ["common", "rare", "epic", "legendary", "mythic"],
            default: "common",
        },

        badgeIcon: {
            type: String,
            default: "award",
        },

        xpReward: {
            type: Number,
            default: 0,
            min: 0,
        },

        coinReward: {
            type: Number,
            default: 0,
            min: 0,
        },

        unlockedAt: {
            type: Date,
            default: Date.now,
        },
    },

    {
        timestamps: true,
    }
);

achievementSchema.index({ user: 1, key: 1 }, { unique: true });
achievementSchema.index({ user: 1, category: 1 });
achievementSchema.index({ user: 1, rarity: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);