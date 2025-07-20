
import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/ecommerce_db";

export const connectDatabase = async () => {
    try {
        await mongoose.connect(DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        process.exit(1);
    }
};

export default mongoose;
