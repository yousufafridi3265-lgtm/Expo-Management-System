import express from "express";
import * as registration from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Attendee
router.post("/", protect, authorizeRoles("attendee"), registration.createRegistration);
router.get("/my", protect, authorizeRoles("attendee"), registration.getMyRegistrations);
router.put("/:id/cancel", protect, authorizeRoles("attendee"), registration.cancelRegistration);

// Admin
router.get("/", protect, authorizeRoles("admin"), getAllRegistrations);

export default router;