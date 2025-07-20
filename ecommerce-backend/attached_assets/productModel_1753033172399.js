import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── Perfume Schema Fields ─────────────────────────────────────────────────────

const perfumeFields = {
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  description: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
  },

  fragrance: {
    type: String,
  },

  stock: {
    type: Number,
    default: 0,
  },
};

// ─── Schema Options ────────────────────────────────────────────────────────────

const schemaOptions = {
  timestamps: true,
  versionKey: false,
};

// ─── Create Perfume Schema ─────────────────────────────────────────────────────

const PerfumeSchema = new Schema(perfumeFields, schemaOptions);

// ─── Export Perfume Model ──────────────────────────────────────────────────────

const Perfume = model("Perfume", PerfumeSchema);
export default Perfume;
