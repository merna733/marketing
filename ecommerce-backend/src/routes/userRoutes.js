
import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    updateUserByAdmin,
    deleteUser
} from "../controllers/userController.js";
import {
    authenticateToken,
    requireAdmin,
    requireOwnershipOrAdmin
} from "../middleware/auth.js";
import {
    validateEmailAvailability,
    hashPassword,
    validateRequiredFields
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post(
    "/register",
    validateRequiredFields(["name", "email", "password"]),
    validateEmailAvailability,
    hashPassword,
    registerUser
);

router.post(
    "/login",
    validateRequiredFields(["email", "password"]),
    loginUser
);

// Protected routes
router.get("/profile", authenticateToken, getUserProfile);

router.put(
    "/profile", 
    authenticateToken, 
    hashPassword,
    updateUserProfile
);

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllUsers);

router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    hashPassword,
    updateUserByAdmin
);

router.delete(
    "/:id",
    authenticateToken,
    requireOwnershipOrAdmin,
    deleteUser
);

export default router;
