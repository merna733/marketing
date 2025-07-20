import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

// ─── User Schema Fields ────────────────────────────────────────────────────────

const userFields = {
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  favorites: [
    {
      type: Types.ObjectId,
      ref: "Perfume",
    },
  ],
};

// ─── Schema Options ────────────────────────────────────────────────────────────

const schemaOptions = {
  timestamps: true,
  versionKey: false,
};

// ─── Create User Schema ────────────────────────────────────────────────────────

const UserSchema = new Schema(userFields, schemaOptions);

// ─── Export User Model ─────────────────────────────────────────────────────────

const User = model("User", UserSchema);
export default User;

