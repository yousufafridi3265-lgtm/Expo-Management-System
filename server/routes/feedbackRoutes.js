import express from "express";
import * as feedback from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Exhibitor aur attendee: feedback bhejna
router.post("/", protect, authorizeRoles("exhibitor", "attendee"), feedback.createFeedback);

// Sirf admin
router.get("/", protect, authorizeRoles("admin"), feedback.getAllFeedback);
router.put("/:id/review", protect, authorizeRoles("admin"), feedback.markFeedbackReviewed);

export default router;