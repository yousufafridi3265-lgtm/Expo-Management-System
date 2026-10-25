import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";

// Public registration mein admin banana allowed nahi hai
const PUBLIC_ROLES = ["exhibitor", "attendee"];

// Client ko sirf yeh fields milti hain, passwordHash kabhi nahi
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: formatUser(user)
});

// Error bhejne ka chota helper: status set karta hai aur error throw karta hai
// const fail = (res, status, message) => {
//   res.status(status);
//   throw new Error(message);
// };

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role = "attendee" } = req.body;

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    fail(res, 400, "Name, email and password are required");
  }
  if (password.length < 6) {
    fail(res, 400, "Password must be at least 6 characters");
  }
  if (!PUBLIC_ROLES.includes(role)) {
    fail(res, 400, "Role must be exhibitor or attendee");
  }

  const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
  if (emailExists) {
    fail(res, 409, "This email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  res.status(201).json(buildAuthResponse(user));
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    fail(res, 400, "Email and password are required");
  }

  // passwordHash select:false hai, isliye yahan khaas taur par maangna parta hai
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

  // Dono galtiyon par ek hi message, taake pata na chale email sahi tha ya nahi
  if (!passwordMatches) {
    fail(res, 401, "Invalid email or password");
  }

  res.json(buildAuthResponse(user));
};

// GET /api/auth/me  (protect middleware pehle req.user set karta hai)
export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};