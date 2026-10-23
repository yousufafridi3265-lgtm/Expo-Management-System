import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // eventId aur boothId server booth se nikalta hai, client ki bheji hui nahi leta
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    boothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booth",
      required: true
    },
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exhibitor",
      required: true
    },
    // confirmed: booth is exhibitor ke paas hai, cancelled: booking khatam, booth dobara free
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    },
    cancelledAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Sab se zaroori rule: ek booth ki sirf EK confirmed booking ho sakti hai.
// Yeh rule database khud lagata hai, is liye do requests ek saath bhi aayein to sirf ek jeetti hai.
// partialFilterExpression ki wajah se sirf confirmed bookings par rule lagta hai,
// is liye cancelled bookings booth ko dobara book hone se nahi rokti (history bhi bachi rehti hai)
bookingSchema.index(
  { boothId: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

// Exhibitor ki apni bookings jaldi milein
bookingSchema.index({ exhibitorId: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;