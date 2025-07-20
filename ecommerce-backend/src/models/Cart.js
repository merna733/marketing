
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const cartItemSchema = new Schema({
    product: {
        type: Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1
    },
    priceAtTime: {
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    couponCode: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Pre-save middleware to calculate totals
cartSchema.pre("save", async function(next) {
    try {
        let subtotal = 0;
        
        for (const item of this.items) {
            if (!item.priceAtTime) {
                const product = await model("Product").findById(item.product);
                if (product) {
                    item.priceAtTime = product.price;
                }
            }
            subtotal += item.priceAtTime * item.quantity;
        }

        // Apply discount
        let discount = 0;
        if (this.discountPercentage > 0) {
            discount = (subtotal * this.discountPercentage) / 100;
        } else if (this.discountAmount > 0) {
            discount = this.discountAmount;
        }

        this.totalAmount = Math.max(0, subtotal - discount);
        next();
    } catch (error) {
        next(error);
    }
});

// Index for faster queries
cartSchema.index({ user: 1 });

const Cart = model("Cart", cartSchema);
export default Cart;
