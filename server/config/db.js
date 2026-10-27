import mongoose from "mongoose";
import env from "dotenv";
import dns from "node:dns";

env.config()

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// MongoDB se connection ek hi jagah par banta hai
const connectDB = async () => {
  try {

    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    await mongoose.connect(uri, {serverSelectionTimeoutMS: 1000});

    console.log(`MongoDB connected Successfully.`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;