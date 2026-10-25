import mongoose from "mongoose";
import env from "dotenv";
import dns from "node:dns";

env.config()

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// MongoDB se connection ek hi jagah par banta hai
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;