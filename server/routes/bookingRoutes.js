import express from "express";
import * as booking from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Exhibitor
router.post("/", protect, authorizeRoles("exhibitor"), booking.createBooking);
router.get("/my", protect, authorizeRoles("exhibitor"), booking.getMyBookings);

// Admin
router.get("/", protect, authorizeRoles("admin"), booking.getAllBookings);

// Exhibitor (apni booking) ya admin (koi bhi). Ownership controller mein check hoti hai
router.put("/:id/cancel", protect, authorizeRoles("exhibitor", "admin"), booking.cancelBooking);

export default router;