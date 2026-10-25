import express from "express";
import { getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Sirf admin
router.get("/", protect, authorizeRoles("admin"), getUsers);

export default router;
