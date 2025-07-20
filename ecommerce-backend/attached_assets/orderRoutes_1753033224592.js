import express from "express";
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
} from "./orderControllers.js";

import { verifyToken } from "../../middleware/verifyToken.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import { isOwnerOrAdmin } from "../../middleware/isOwnerOrAdmin.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createOrder);
router.get("/my-orders", getUserOrders);
router.get("/", isAdmin, getAllOrders);
router.put("/:id/status", isAdmin, updateOrderStatus);
router.put("/:id/cancel", isOwnerOrAdmin, cancelOrder);

export default router;
