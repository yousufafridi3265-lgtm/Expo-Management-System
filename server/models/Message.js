import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Kis ne inquiry bheji (exhibitor ya attendee). Hamesha token se aati hai
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Optional: inquiry kis event ke baare mein hai
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [150, "Subject must be at most 150 characters"]
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message must be at most 2000 characters"]
    },
    // open: admin ke jawab ka intezar, replied: admin jawab de chuka
    status: {
      type: String,
      enum: ["open", "replied"],
      default: "open"
    },
    // Admin ka jawab. Alag message nahi banate, usi inquiry ke andar rakhte hain
    reply: {
      type: String,
      trim: true,
      maxlength: [2000, "Reply must be at most 2000 characters"]
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    repliedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Sender ke apne messages aur admin ki list (status se) jaldi milein
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;