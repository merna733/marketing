
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        unique: true,
        minlength: [2, "Product name must be at least 2 characters"],
        maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    imageUrl: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    fragrance: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, "Stock cannot be negative"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
    return this.stock > 0 && this.isActive;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

const Product = model("Product", productSchema);
export default Product;
