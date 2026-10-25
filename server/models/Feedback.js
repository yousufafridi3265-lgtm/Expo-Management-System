import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // Kis ne feedback diya. Hamesha token se aati hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [150, "Subject must be at most 150 characters"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"]
    },
    // new: abhi admin ne nahi dekha, reviewed: admin dekh chuka
    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new"
    }
  },
  { timestamps: true }
);

// Admin ki list (status se) jaldi mile
feedbackSchema.index({ status: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
