import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

// ─── Sub-Document: Perfume Item in Order ───────────────────────────────────────

const orderItemSchema = {
  perfume: {
    type: Types.ObjectId,
    ref: "Perfume",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
};

// ─── Main Order Fields ─────────────────────────────────────────────────────────

const orderFields = {
  customer: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },

  orderItems: [orderItemSchema],

  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
};

// ─── Schema Options ────────────────────────────────────────────────────────────

const schemaOptions = {
  timestamps: true,
  versionKey: false,
};

// ─── Create Order Schema ───────────────────────────────────────────────────────

const OrderSchema = new Schema(orderFields, schemaOptions);

// ─── Export Model ──────────────────────────────────────────────────────────────

const Order = model("Order", OrderSchema);
export default Order;
