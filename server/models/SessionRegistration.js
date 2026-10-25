import mongoose from "mongoose";

const sessionRegistrationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true
    },
    // Attendee bhi ek User hai, is liye User ko refer karte hain
    attendeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // registered: attendee register hai, cancelled: attendee ne registration khatam kar di
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered"
    },
    cancelledAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Ek attendee ek session mein sirf ek baar "registered" ho sakta hai (database lagata hai).
// Sirf registered par rule hai, is liye cancel karne ke baad dobara register ho sakta hai
sessionRegistrationSchema.index(
  { sessionId: 1, attendeeId: 1 },
  { unique: true, partialFilterExpression: { status: "registered" } }
);

// Attendee ki apni registrations jaldi milein
sessionRegistrationSchema.index({ attendeeId: 1, createdAt: -1 });

const SessionRegistration = mongoose.model("SessionRegistration", sessionRegistrationSchema);

export default SessionRegistration;
