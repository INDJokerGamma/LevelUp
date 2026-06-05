const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../modles/User");

const protect = asyncHandler(async (req, res, next) => {
    const token = rew.cookies.token;

    if(!token) {
        res.status(401);
        throw new Error ("Unauthorized Login Attempt... Please Log in..");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if(!user){
        res.status(401);
        throw new Error ("User no Longer exists..");
    }

    req.user = user;
    next();
});

const authorize = (...roles) =>{
    return (req, res, next) =>{
        if(!req.user || !roles.includes(req.user.role)){
            res.status(403);
            throw new Error ("You are not have permissions to Perform this action");
        }
        next();
    };
};

module.exports ={
    protect, 
    authorize,
};