import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
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

// Ek attendee ek event mein sirf ek baar "registered" ho sakta hai (database lagata hai).
// Sirf registered par rule hai, is liye cancel karne ke baad wohi attendee dobara register kar sakta hai
eventRegistrationSchema.index(
  { eventId: 1, attendeeId: 1 },
  { unique: true, partialFilterExpression: { status: "registered" } }
);

// Attendee ki apni registrations jaldi milein
eventRegistrationSchema.index({ attendeeId: 1, createdAt: -1 });

const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);

export default EventRegistration;