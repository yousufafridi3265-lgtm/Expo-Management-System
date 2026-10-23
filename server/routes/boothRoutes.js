import express from "express";
import * as booth from "../controllers/boothController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: koi bhi booths dekh sakta hai
router.get("/", booth.getBooths);
router.get("/:id", booth.getBoothById);

// Sirf admin
router.post("/", protect, authorizeRoles("admin"), booth.createBooth);
router.put("/:id", protect, authorizeRoles("admin"), booth.updateBooth);
router.delete("/:id", protect, authorizeRoles("admin"), booth.deleteBooth);

export default router;