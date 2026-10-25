import User from "../models/User.js";
import { fail, checkValidId, applyFields } from "../utils/fail.js";

const ROLES = User.schema.path("role").enumValues;

// GET /api/users  (sirf admin): sab users
// Filter: ?role=exhibitor
export const getUsers = async (req, res) => {
  const filter = {};

  if (req.query.role !== undefined) {
    if (!ROLES.includes(req.query.role)) {
      fail(res, 400, "Invalid role filter");
    }
    filter.role = req.query.role;
  }

  // Sirf yeh fields. passwordHash ko yahan maangte hi nahi
  const users = await User.find(filter).select("name email role createdAt").sort({ createdAt: -1 });

  res.json(users);
};

