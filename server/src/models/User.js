const mongoose = require ('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength:[5, "Name must be atleast 5 charcters"],
        maxlength:[60, "Name must not exceed 60 Characters"],
    },
    username:{
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        minlength:[5, "Username must be atleast 5 charcters"],
        maxlength:[30, "Username must not exceed 30 Characters"],
        match:[
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain Letters, numbers and underScores",
        ],
    },

    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email"
        ],
    },

    password:{
        type: String,
        required: [true, "Password is required"],
        minlength:[8,"Password must be atleast 8 charcters"],
        select: false,
    },

    avatar:{
        type: String,
        default:" ",
    },

    bio:{
        type: String,
        default: " ",
        maxlength: [300, "Bio cannot exceed more than 300 charcters"],
    },

    role:{
        type: String,
        enum:["user","admin"],
        default:"user",
    },

    isEmailVerified:{
        type: Boolean,
        default: false,
    },

    level:{
        type: Number,
        default: 1,
        min: 1,
    },

    xp:{
        type:Number,
        min:0,
        default:0,
    },

    coins:{
        type: Number,
        min: 0,
        default: 0,
    },

    gems:{
        type: Number,
        default: 0,
        min: 0,
    },

    rankTitle:{
        type: String,
        default: "beginner",
    },

    currentStreak:{
        type: Number,
        default: 0,
        min:0,
    },

    longestStreak:{
        type: Number,
        default:0,
        min:0,
    },

    totalHabitsComplete:{
        type: Number,
        default:0,
        min:0,
    },

    focusMinutes:{
        type: Number,
        default: 0,
        min: 0,
    },

    productivityScore:{
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    consistencyScore:{
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    lifeBalanceScore:{
        type: Number,
        default: 0,
        min: 0,
        max: 0,
    },

    unlockedThemes:{
        type: [String],
        default: ["Default"],
    },

    equippedTheme:{
        type: String,
        default: "default",
    },

    privacySetting:{
        showProfile:{
            type:Boolean,
            default: true,
        },
        showStats:{
            type: Boolean,
            default: true,
        },

        showWellnessData:{
            type: Boolean,
            default: false,
        },
    },

    notificationSettings:{
        habitReminder:{
            type: Boolean,
            default: true,
        },
        questReminder:{
            type: Boolean,
            default: true,
        },
        StreakWarning:{
            type: Boolean,
            default: true,
        },
        Motivation:{
            type: Boolean,
            default: true,
        },
    },

    passwordResetToken:{
        type: String,
        select: false,
    },
    passwordResetExpires:{
        type: Date,
        select: false,
    },
    emailVerificationToken:{
        type:String,
        select: false,
    },   
},
{
    timestamps: true,
}
);

// userSchema.index({username: 1});
// userSchema.index({email: 1});
userSchema.index({xp:-1});
userSchema.index({level: -1});
userSchema.index({createdAt: -1});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function() {
    const user = this.toObject();
    delete user.password ;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    delete user.emailVerificationToken;
    return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;