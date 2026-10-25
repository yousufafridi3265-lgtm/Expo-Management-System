import mongoose from "mongoose";

const sessionBookmarkSchema = new mongoose.Schema(
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
    }
  },
  // Sirf createdAt chahiye (kab bookmark kiya)
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Ek attendee ek session ko sirf ek baar bookmark kar sakta hai (database lagata hai).
// Bookmark hatane par record delete ho jata hai, is liye dobara bookmark karne mein koi masla nahi
sessionBookmarkSchema.index({ sessionId: 1, attendeeId: 1 }, { unique: true });

// Attendee ke apne bookmarks jaldi milein
sessionBookmarkSchema.index({ attendeeId: 1, createdAt: -1 });

const SessionBookmark = mongoose.model("SessionBookmark", sessionBookmarkSchema);

export default SessionBookmark;