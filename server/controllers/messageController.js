import Message from "../models/Message.js";
import Event from "../models/Event.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";

const MESSAGE_STATUSES = ["open", "replied"];

// POST /api/messages  (exhibitor ya attendee): admin ko inquiry bhejna
// Body: { "subject": "...", "message": "...", "eventId": "..." (optional) }
export const createMessage = async (req, res) => {
  const { eventId, subject, message } = req.body;

  // eventId optional hai. Di gayi ho to sahi shakal ki aur maujood honi chahiye
  const hasEventId = eventId !== undefined && eventId !== null && eventId !== "";
  if (hasEventId) {
    checkValidId(res, eventId, "event");

    const eventExists = await Event.exists({ _id: eventId });
    if (!eventExists) {
      fail(res, 404, "Event not found");
    }
  }

  // senderId token se aati hai, body se nahi. Baqi validation (subject, message) model karta hai
  const savedMessage = await Message.create({
    senderId: req.user._id,
    eventId: hasEventId ? eventId : undefined,
    subject,
    message
  });

  res.status(201).json(savedMessage);
};

// GET /api/messages/my  (exhibitor ya attendee): apni inquiries aur admin ke jawab
export const getMyMessages = async (req, res) => {
  const messages = await Message.find({ senderId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("eventId", "name");

  res.json(messages);
};

// GET /api/messages  (sirf admin): sab inquiries
// Filters: ?status=open  aur  ?eventId=...
export const getAllMessages = async (req, res) => {
  const filter = {};

  if (req.query.status !== undefined) {
    if (!MESSAGE_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  if (req.query.eventId !== undefined) {
    checkValidId(res, req.query.eventId, "event");
    filter.eventId = req.query.eventId;
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .populate("senderId", "name email role")
    .populate("eventId", "name");

  res.json(messages);
};

// PUT /api/messages/:id/reply  (sirf admin): inquiry ka jawab dena. Body: { "reply": "..." }
export const replyToMessage = async (req, res) => {
  checkValidId(res, req.params.id, "message");

  const { reply } = req.body;
  if (typeof reply !== "string" || !reply.trim()) {
    fail(res, 400, "Reply is required");
  }

  // Sirf "open" inquiry ka jawab diya ja sakta hai. Check aur update ek hi database step mein hain,
  // is liye do admins ek saath jawab dein to sirf pehla jeetta hai
  const message = await Message.findOneAndUpdate(
    { _id: req.params.id, status: "open" },
    { reply, status: "replied", repliedBy: req.user._id, repliedAt: new Date() },
    { returnDocument: "after", runValidators: true }
  );

  if (!message) {
    const messageExists = await Message.exists({ _id: req.params.id });
    if (!messageExists) {
      fail(res, 404, "Message not found");
    }
    fail(res, 409, "This message has already been replied to");
  }

  res.json(message);
};
