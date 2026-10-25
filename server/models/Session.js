import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // Session kis event ka hai
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title must be at most 150 characters"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    // session: aam session ya talk, workshop: hands-on workshop
    type: {
      type: String,
      enum: ["session", "workshop"],
      default: "session"
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      // End time start time ke baad honi chahiye
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time"
      }
    },
    location: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

// Ek event ke sessions time ke hisaab se sort hote hain
sessionSchema.index({ eventId: 1, startTime: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;

