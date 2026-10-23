import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "dotenv";

env.config();

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});