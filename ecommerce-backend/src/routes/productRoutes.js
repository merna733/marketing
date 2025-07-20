
import express from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getProductCategories
} from "../controllers/productController.js";
import {
    authenticateToken,
    requireAdmin
} from "../middleware/auth.js";
import {
    validateRequiredFields
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/categories", getProductCategories);
router.get("/:id", getProductById);

// Admin routes
router.post(
    "/",
    authenticateToken,
    requireAdmin,
    validateRequiredFields(["name", "price", "category"]),
    createProduct
);

router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    updateProduct
);

router.patch(
    "/:id/stock",
    authenticateToken,
    requireAdmin,
    validateRequiredFields(["stock"]),
    updateProductStock
);

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    deleteProduct
);

export default router;
