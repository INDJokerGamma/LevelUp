const express = require("express");
const sendResponse = require("../utils/apiResponse");

const router = express.Router();

router.get("/", (req, res) => {
    sendResponse(res, 200, "Server is healthy", {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;