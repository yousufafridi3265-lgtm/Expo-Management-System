// Pehla admin banane ka script. Chalane ka tareeqa: npm run seed:admin
// Email aur password .env se aate hain (code mein password nahi likhte)
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const { ADMIN_NAME = "Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Pehle .env mein ADMIN_EMAIL aur ADMIN_PASSWORD likhein.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_PASSWORD kam az kam 8 characters ka hona chahiye.");
  process.exit(1);
}

await connectDB();

const email = ADMIN_EMAIL.trim().toLowerCase();
const existingUser = await User.findOne({ email });

if (existingUser) {
  // Is email ka user pehle se hai: usay admin bana dete hain, password nahi badalte
  existingUser.role = "admin";
  await existingUser.save();
  console.log(`${email} already existed, now they are an admin (password was not changed).`);
} else {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ name: ADMIN_NAME, email, passwordHash, role: "admin" });
  console.log(`Admin Created: ${email}`);
}


await mongoose.disconnect();
