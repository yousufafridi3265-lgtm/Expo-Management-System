import express from "express";
import * as message from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Exhibitor aur attendee: inquiry bhejna aur apni inquiries dekhna
router.post("/", protect, authorizeRoles("exhibitor", "attendee"), message.createMessage);
router.get("/my", protect, authorizeRoles("exhibitor", "attendee"), message.getMyMessages);

// Sirf admin
router.get("/", protect, authorizeRoles("admin"), message.getAllMessages);
router.put("/:id/reply", protect, authorizeRoles("admin"), message.replyToMessage);

export default router;