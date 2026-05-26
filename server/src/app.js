const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require ("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanatize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const healthRoutes = require("./routes/healthRoutes");
const {notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();

app.set("trust proxy", 1);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(helmet());

app.use(
    rateLimit({
        windowMs: 15 *60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended:true, limi: "10kb"}));
app.use(cookieParser());
app.use(mongoSanatize());
app.use(xss());

app.get("/", (req,res) =>{
    res.json({
        success: true,
        message: "API is running properly, Good to Go",
    });
});

app.use("/api/health", healthRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;