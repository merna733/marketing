
import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
} from "../controllers/orderController.js";
import {
    authenticateToken,
    requireAdmin,
    requireOwnershipOrAdmin
} from "../middleware/auth.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// User routes
router.post("/", createOrder);
router.get("/my-orders", getUserOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

// Admin routes
router.get("/", requireAdmin, getAllOrders);
router.get("/admin/stats", requireAdmin, getOrderStats);
router.patch("/:orderId/status", requireAdmin, updateOrderStatus);

export default router;
