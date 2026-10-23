import express from "express";
import * as exhibitor  from "../controllers/exhibitorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadLogo } from "../utils/upload.js";

const router = express.Router();

// Public
router.get("/", exhibitor.getExhibitors);

// Exhibitor ke apne routes. "/my" ko "/:id" se pehle likhna zaroori hai,
// warna Express "my" ko id samajh leta hai
router.get("/my", protect, authorizeRoles("exhibitor"), exhibitor.getMyExhibitor);
router.post("/", protect, authorizeRoles("exhibitor"), exhibitor.createExhibitor);
router.put("/my", protect, authorizeRoles("exhibitor"), exhibitor.updateMyExhibitor);
// Pehle login aur role check, phir file upload
router.put("/my/logo", protect, authorizeRoles("exhibitor"), uploadLogo, exhibitor.uploadMyLogo);

// Admin ke routes
router.get("/admin/all", protect, authorizeRoles("admin"), exhibitor.getAllExhibitorsForAdmin);
router.put("/:id/status", protect, authorizeRoles("admin"), exhibitor.updateApprovalStatus);

// Public: ek exhibitor ka profile
router.get("/:id", exhibitor.getExhibitorById);

export default router;