require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn("MONGO_URI is missing. Server started without database connection.");
}

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});