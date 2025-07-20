
import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon
} from "../controllers/cartController.js";
import {
    authenticateToken
} from "../middleware/auth.js";
import {
    validateRequiredFields
} from "../middleware/validation.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get("/", getCart);

router.post(
    "/items",
    validateRequiredFields(["productId"]),
    addToCart
);

router.put(
    "/items/:productId",
    validateRequiredFields(["quantity"]),
    updateCartItem
);

router.delete("/items/:productId", removeFromCart);

router.delete("/clear", clearCart);

router.post(
    "/coupon",
    validateRequiredFields(["couponCode"]),
    applyCoupon
);

export default router;
