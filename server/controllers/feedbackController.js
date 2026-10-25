import Feedback from "../models/Feedback.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";

const FEEDBACK_STATUSES = ["new", "reviewed"];

// POST /api/feedback  (exhibitor ya attendee): feedback bhejna
// Body: { "subject": "...", "description": "..." }
export const createFeedback = async (req, res) => {
  const { subject, description } = req.body;

  // userId token se aati hai, body se nahi. status hamesha "new" se shuru hota hai.
  // Baqi validation (subject, description) model karta hai
  const feedback = await Feedback.create({
    userId: req.user._id,
    subject,
    description
  });

  res.status(201).json(feedback);
};

// GET /api/feedback  (sirf admin): sab feedback
// Filter: ?status=new
export const getAllFeedback = async (req, res) => {
  const filter = {};

  if (req.query.status !== undefined) {
    if (!FEEDBACK_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  const feedback = await Feedback.find(filter)
    .sort({ createdAt: -1 })
    .populate("userId", "name email role");

  res.json(feedback);
};

// PUT /api/feedback/:id/review  (sirf admin): feedback ko "reviewed" mark karna
export const markFeedbackReviewed = async (req, res) => {
  checkValidId(res, req.params.id, "feedback");

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: "reviewed" },
    { returnDocument: "after" }
  );
  if (!feedback) {
    fail(res, 404, "Feedback not found");
  }

  res.json(feedback);
};
