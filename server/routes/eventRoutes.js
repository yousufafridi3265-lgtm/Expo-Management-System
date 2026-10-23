import express from "express";
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: koi bhi events dekh sakta hai
router.get("/", getEvents);
router.get("/:id", getEventById);

// Sirf admin: pehle login (protect), phir role check (authorizeRoles)
router.post("/", protect, authorizeRoles("admin"), createEvent);
router.put("/:id", protect, authorizeRoles("admin"), updateEvent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteEvent);

export default router;