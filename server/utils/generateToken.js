import jwt from "jsonwebtoken";

// User ki id se JWT token banata hai. Role token mein nahi rakhte, middleware database se leta hai
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export default generateToken; 