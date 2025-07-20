import express from "express";
import {
    addPerfume,
    getAllPerfumes,
    getPerfumeById,
    updatePerfume,
    deleteAllPerfumes,
    deletePerfume,
} from "./perfumeControllers.js";

import { verifyToken } from "../../middleware/verifyToken.js";
import { isAdmin } from "../../middleware/isAdmin.js";

const router = express.Router();

router.get("/", getAllPerfumes);
router.get("/:id", getPerfumeById);
router.post("/", verifyToken, isAdmin, addPerfume);
router.put("/:id", verifyToken, isAdmin, updatePerfume);
router.delete("/", verifyToken, isAdmin, deleteAllPerfumes);
router.delete("/:id", verifyToken, isAdmin, deletePerfume);

export default router;
