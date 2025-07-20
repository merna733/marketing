import express from "express";
import {
    signup,
    login,
    getAllUsers,
    updateOwnProfile,
    updateUserByAdmin,
    deleteUser,
} from "./userControllers.js";

import { checkEmail } from "../../middleware/checkEmail.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import { isOwnerOrAdmin } from "../../middleware/isOwnerOrAdmin.js";

const router = express.Router();

router.post("/signup", checkEmail, signup);

router.post("/login", login);

router.get("/", verifyToken, isAdmin, getAllUsers);

router.put("/profile", verifyToken, updateOwnProfile);

router.put("/:id", verifyToken, isAdmin, updateUserByAdmin);

router.delete("/:id", verifyToken, isOwnerOrAdmin, deleteUser);

export default router;
