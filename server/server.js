import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "dotenv";

env.config();

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (error) {
  console.error("DATABASE STARTUP ERROR:", error);
  throw error;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


