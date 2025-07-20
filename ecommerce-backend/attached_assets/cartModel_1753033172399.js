import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

// ─── Field Definitions ─────────────────────────────────────────────────────────

const cartItemSchema = {
  product: {
    type: Types.ObjectId,
    ref: "Perfume",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  itemTotal: {
    type: Number,
    default: 0,
  },
};

const shoppingCartFields = {
  customer: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  cartItems: [cartItemSchema],

  totalPrice: {
    type: Number,
    default: 0,
  },

  couponCode: {
    type: String,
    default: null,
  },

  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  isCheckedOut: {
    type: Boolean,
    default: false,
  },
};

// ─── Schema Options ────────────────────────────────────────────────────────────

const schemaOptions = {
  timestamps: true,
  versionKey: false,
};

// ─── Create Schema ─────────────────────────────────────────────────────────────

const ShoppingCartSchema = new Schema(shoppingCartFields, schemaOptions);

// ─── Pre-save Hook: Auto-calculate totals ──────────────────────────────────────

ShoppingCartSchema.pre("save", async function (next) {
  try {
    let grandTotal = 0;

    for (const item of this.cartItems) {
      const product = await model("Perfume").findById(item.product);
      if (product) {
        item.itemTotal = product.price * item.quantity;
        grandTotal += item.itemTotal;
      }
    }

    if (this.discountPercent > 0) {
      grandTotal -= (grandTotal * this.discountPercent) / 100;
    }

    this.totalPrice = grandTotal;
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Export Model ──────────────────────────────────────────────────────────────

const ShoppingCart = model("ShoppingCart", ShoppingCartSchema);
export default ShoppingCart;

