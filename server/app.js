import cors from "cors";
import express from "express";
import { LOGOS_DIR } from "./utils/upload.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import boothRoutes from "./routes/boothRoutes.js"; 
import bookingRoutes from "./routes/bookingRoutes.js";
import exhibitorRoutes from "./routes/exhibitorRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Health check: server chal raha hai ya nahi
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Expo Management API is running" });
});

// Sirf logos public hain. Documents (baad mein) is folder se alag rahenge
app.use("/uploads/logos", express.static(LOGOS_DIR));

// Route files yahan register hongi (har module ke baad ek ek karke)
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/exhibitors", exhibitorRoutes);
app.use("/api/booths", boothRoutes);  
app.use("/api/bookings", bookingRoutes);
app.use("/api/registrations", registrationRoutes);

// Error middleware hamesha sab routes ke baad aati hai
app.use(notFound);
app.use(errorHandler);

export default app;