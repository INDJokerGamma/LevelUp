const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const User = require("../models/User");
const sendResponse = require ("../utils/apiResponse");

const {
    signToken,
    sendTokenCookie,
    clearTokenCookie,
} = require("../services/tokenService");
// const { use } = require("react");

const signup = asyncHandler(async(req, res) =>{
    const{name, username, email, password, confirmPassword, avatar} = req.body;

    if(!name || !username || !email || !password || !confirmPassword){
        res.status(400);
        throw new Error ("Please fill in all the required Fields");
    }

    if(password != confirmPassword ){
        res.status(400);
        throw new Error ("Password does not Match");
    }

    const existingUser = await User.findOne({
        $or:[{ email: email.toLowerCase() }, { username: username.toLowerCase()
        }],
    });

    if (existingUser){
        res.status(409);
        throw new Error("Email or Usernbame already exists");
    }

    const user = await User.create({
        name, username, email, password, avatar,
    });

    const token = signToken(user.id);
    sendTokenCookie(res, token);

    sendResponse(res, 201, "Signup successful",{
        user: user.toSafeObject(),
    });
});

const login = asyncHandler(async(req, res) =>{
    const {identifier, password} = req.body;

    if(!identifier || !password){
        res.status(400);
        throw new Error ("Please provide email/username anf password");
    }

    const user = await User.findOne({
        $or:[
            {email: identifier.toLowerCase()},
            {username: identifier.toLowerCase()},
        ],
    }).select("+password");

    if(!user || !(await user.matchPassword(password))){
        res.status(401);
        throw new Error("Invalid Login Credentials..");
    }

    const token = signToken(user._id);
    sendTokenCookie(res,token);

    sendResponse(res, 200, "Login Successful..",{
        user:user.toSafeObject(),
    });
});

const logout = asyncHandler(async(req,res) =>{
    clearTokenCookie(res);
    sendResponse(res, 200,"Logout Successful..");
});

const getMe = asyncHandler(async(req,res) =>{
    sendResponse(res,200,"Current User Fetched..",{
        user: req.user.toSafeObject(),
    });
});

const forgotPassword  = asyncHandler(async(req, res)=>{
    const {email} = req.body;

    if(!email){
        res.status(400);
        throw new Error("Please Provode your Email..");
    }

    const user = await User.findOne({email: email.toLowerCase()}). select(
        "+passwordResettoken +passwordRestExpires"
    );
    if(!user){
        sendResponse(res,200, "If the email exists, a reset link will be sent..");
        return ;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpired= Date.now() +15*60*1000;

    await user.save({validateBeforeSave: false});

    sendResponse(res,200,"Password reset Token Generated", {
        resetToken,
        note: "In Production this token will be sent by email, not returnred in API Response..",
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const {token} = req.params;
    const {password, confirmPassword} = req.body;

    if(!password || !confirmPassword) {
        res.status(400);
        throw new Error("Please provode password and confirm password");
    }

    if(password != confirmPassword){
        res.status(400);
        throw new Error("Passwords do not match");
    }

    const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hesx");

    const user = await User.findOne({
        passwordReserToken: hashedToken,
        passwordResetExpires: {$gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if(!user){
        res.status(400);
        throw new Error("Reset token is invalid or expired...");
    }

    user.password = password;
    user.passwordReserToken = undefined;
    user.passwordResetExpired = undefined;

    await user.save();
    const authToken = signToken(user._id);
    sendTokenCookie(res, authToken);

    sendResponse(res, 200, "Password reset successful.. ",{
        user: user.toSafeObject(),
    });
});

module.exports ={
    signup,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
};