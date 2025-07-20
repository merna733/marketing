import express from "express";
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
} from "./cartControllers.js";

import { verifyToken } from "../../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/clear", clearCart);
router.delete("/:perfumeId", removeFromCart);

export default router;
