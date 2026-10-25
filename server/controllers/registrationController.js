import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";
import Session from "../models/Session.js";
import SessionRegistration from "../models/SessionRegistration.js";

const REGISTRATION_STATUSES = ["registered", "cancelled"];

// POST /api/registrations  (sirf attendee): event ke liye register karna. Body: { "eventId": "..." }
export const createRegistration = async (req, res) => {
  const { eventId } = req.body;
  checkValidId(res, eventId, "event");

  const event = await Event.findById(eventId);
  if (!event) {
    fail(res, 404, "Event not found");
  }
  if (event.status !== "upcoming") {
    fail(res, 409, "Registration is closed for this event");
  }

  // attendeeId token se aati hai, body se nahi.
  // Dobara register karne par database ka unique index duplicate error deta hai
  try {
    const registration = await EventRegistration.create({
      eventId: event._id,
      attendeeId: req.user._id
    });
    res.status(201).json(registration);
  } catch (error) {
    failOnDuplicate(res, error, "You are already registered for this event");
  }
};

// GET /api/registrations/my  (sirf attendee): apni registrations
export const getMyRegistrations = async (req, res) => {
  const registrations = await EventRegistration.find({ attendeeId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("eventId", "name startDate endDate location status");

  res.json(registrations);
};

// GET /api/registrations  (sirf admin): sab registrations
// Filters: ?eventId=...  aur  ?status=registered
export const getAllRegistrations = async (req, res) => {
  const filter = {};

  if (req.query.eventId !== undefined) {
    checkValidId(res, req.query.eventId, "event");
    filter.eventId = req.query.eventId;
  }

  if (req.query.status !== undefined) {
    if (!REGISTRATION_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  const registrations = await EventRegistration.find(filter)
    .sort({ createdAt: -1 })
    .populate("attendeeId", "name email")
    .populate("eventId", "name startDate");

  res.json(registrations);
};

// PUT /api/registrations/:id/cancel  (sirf attendee, apni registration)
export const cancelRegistration = async (req, res) => {
  checkValidId(res, req.params.id, "registration");

  // attendeeId filter mein hai, is liye dusre ki registration cancel nahi hoti (404 milta hai)
  const registration = await EventRegistration.findOneAndUpdate(
    { _id: req.params.id, attendeeId: req.user._id, status: "registered" },
    { status: "cancelled", cancelledAt: new Date() },
    { returnDocument: "after" }
  );
  if (!registration) {
    fail(res, 404, "Active registration not found");
  }

  // Event ki registration khatam to us event ke sessions ki registrations bhi khatam
  const sessionIds = await Session.find({ eventId: registration.eventId }).distinct("_id");
  await SessionRegistration.updateMany(
    { attendeeId: req.user._id, sessionId: { $in: sessionIds }, status: "registered" },
    { status: "cancelled", cancelledAt: new Date() }
  );

  res.json(registration);
};

