import mongoose from "mongoose";

const DB = "mongodb://localhost:27017/Ecommerce";

export const dbConnection = mongoose
    .connect(DB)
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.error("DB connection error:", err);
    });
