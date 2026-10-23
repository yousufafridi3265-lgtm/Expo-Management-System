import mongoose from "mongoose";

const boothSchema = new mongoose.Schema(
  {
    // Booth kis event ka hai
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    boothNumber: {
      type: String,
      required: [true, "Booth number is required"],
      trim: true,
      maxlength: [20, "Booth number must be at most 20 characters"]
    },
    // Floor plan mein jagah, jaise "Hall A, Row 2"
    location: {
      type: String,
      trim: true,
      default: ""
    },
    // Jaise "3x3 m"
    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    // available: book ho sakta hai, booked: kisi ne le liya (Booking module set karega),
    // unavailable: admin ne band kar diya
    status: {
      type: String,
      enum: ["available", "booked", "unavailable"],
      default: "available"
    }
  },
  { timestamps: true }
);

// Ek event mein ek booth number sirf ek baar. Alag events mein wohi number ho sakta hai
boothSchema.index({ eventId: 1, boothNumber: 1 }, { unique: true });

const Booth = mongoose.model("Booth", boothSchema);

export default Booth;