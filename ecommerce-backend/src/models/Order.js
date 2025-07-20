
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const orderItemSchema = new Schema({
    product: {
        type: Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"]
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    priceAtTime: {
        type: Number,
        required: [true, "Price at time of order is required"],
        min: [0, "Price cannot be negative"]
    }
}, { _id: false });

const orderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"]
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            message: "Invalid order status"
        },
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ["pending", "paid", "failed", "refunded"],
            message: "Invalid payment status"
        },
        default: "pending"
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    notes: {
        type: String,
        maxlength: [500, "Notes cannot exceed 500 characters"]
    }
}, {
    timestamps: true,
    versionKey: false
});

// Generate order number before saving
orderSchema.pre("save", function(next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Indexes for better performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

const Order = model("Order", orderSchema);
export default Order;
