const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
            index: true,
        },

        habit:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Habit",
            required: true,
            index: true,
        },
        date:{
            type: Date,
            required: true,
        },
        status:{
            type:String,
            enum: ["completed", "missed", "skipped", "protected"],
            default: "completed",
        },

        completedAt:{
            type: Date,
            default: null,
        },

        xpEarned:{
            type:Number,
            default: 0,
            min:0,
        },
        coinsEarned:{
            type:Number,
            default:0,
            min:0,
        },

        notes:{
            type:String,
            trim:true,
            maxlength: [500,"Note cannot exceed 500 charcaters"],
            default:"",
        },
    },
    {
        timestamps: true,
    }   
);

habitLogSchema.index({user: 1, date: -1});
habitLogSchema.index({habit: 1, date: -1});
habitLogSchema.index({user: 1, habit: 1, date: 1},{unique: true});

module.exports = mongoose.model("HabitLog", habitLogSchema);
