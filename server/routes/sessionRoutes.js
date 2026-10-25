import express from "express";
import * as session from "../controllers/sessionController.js";
import * as bookmark from "../controllers/bookmarkController.js";
import * as sessionRegistration from "../controllers/sessionRegistrationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: koi bhi sessions dekh sakta hai
router.get("/", session.getSessions);

// Attendee ke apne bookmarks aur registrations
// Yeh routes "/:id" se pehle hain taake inhein id na samjha jaye
router.get( "/bookmarks/my", protect, authorizeRoles("attendee"), bookmark.getMyBookmarks);

router.get( "/registrations/my", protect, authorizeRoles("attendee"), sessionRegistration.getMySessionRegistrations);

// Kisi bhi session ki details
router.get("/:id", session.getSessionById);

// Sirf attendee: bookmark lagana aur hatana
router.post("/:id/bookmark", protect, authorizeRoles("attendee"), bookmark.addBookmark);

router.delete("/:id/bookmark", protect, authorizeRoles("attendee"), bookmark.removeBookmark);

// Sirf attendee: session ke liye register aur cancel
router.post( "/:id/register", protect, authorizeRoles("attendee"), sessionRegistration.registerForSession);

router.delete( "/:id/register", protect, authorizeRoles("attendee"), sessionRegistration.cancelSessionRegistration);

// Sirf admin: session ki registrations dekh sakta hai
router.get("/:id/registrations", protect,authorizeRoles("admin"),sessionRegistration.getSessionRegistrations);

// Sirf admin: session create, update aur delete kar sakta hai
router.post("/", protect, authorizeRoles("admin"), session.createSession);
router.put("/:id", protect, authorizeRoles("admin"), session.updateSession);
router.delete("/:id", protect, authorizeRoles("admin"), session.deleteSession);

export default router;
