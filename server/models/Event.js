import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
        name: {
        type: String,
        required: [true, "Event name is required"],
        trim: true,
        maxlength: [150, "Event name must be at most 150 characters"]
        },
        description: {
        type: String,
        trim: true,
        default: ""
        },
        startDate: {
        type: Date,
        required: [true, "Start date is required"]
        },
        endDate: {
        type: Date,
        required: [true, "End date is required"],
        // End date start date se pehle nahi ho sakti
        validate: {
            validator: function (value) {
            return value >= this.startDate;
            },
            message: "End date cannot be before start date"
        }
        },
        location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
        },
        status: {
        type: String,
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        default: "upcoming"
        },
        // Kis admin ne event banaya. Yeh hamesha token se aata hai, body se nahi
        createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
        }
    },
    { timestamps: true }
);

// Events aksar start date ke hisaab se sort hote hain, isliye index
eventSchema.index({ startDate: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;