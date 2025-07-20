
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
        type: String,
        enum: {
            values: ["user", "admin"],
            message: "Role must be either user or admin"
        },
        default: "user"
    },
    favoriteProducts: [{
        type: Types.ObjectId,
        ref: "Product"
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Transform output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = model("User", userSchema);
export default User;
