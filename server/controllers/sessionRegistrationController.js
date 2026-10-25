import SessionRegistration from "../models/SessionRegistration.js";
import Session from "../models/Session.js";
import EventRegistration from "../models/EventRegistration.js";
import { fail, checkValidId, failOnDuplicate } from "../utils/fail.js";

const REGISTRATION_STATUSES = ["registered", "cancelled"];

// POST /api/sessions/:id/register  (sirf attendee): session ke liye register karna
export const registerForSession = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  const session = await Session.findById(req.params.id);
  if (!session) {
    fail(res, 404, "Session not found");
  }
  if (session.startTime <= new Date()) {
    fail(res, 409, "This session has already started");
  }

  // Session event ka hissa hai, is liye pehle us event mein register hona zaroori hai
  const isRegisteredForEvent = await EventRegistration.exists({
    eventId: session.eventId,
    attendeeId: req.user._id,
    status: "registered"
  });
  if (!isRegisteredForEvent) {
    fail(res, 403, "Register for the event first");
  }

  // attendeeId token se aati hai. Dobara register karne par unique index duplicate error deta hai
  try {
    const registration = await SessionRegistration.create({
      sessionId: session._id,
      attendeeId: req.user._id
    });
    res.status(201).json(registration);
  } catch (error) {
    failOnDuplicate(res, error, "You are already registered for this session");
  }
};

// DELETE /api/sessions/:id/register  (sirf attendee): session ki apni registration cancel karna
export const cancelSessionRegistration = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  // attendeeId filter mein hai, is liye attendee sirf apni registration cancel kar sakta hai
  const registration = await SessionRegistration.findOneAndUpdate(
    { sessionId: req.params.id, attendeeId: req.user._id, status: "registered" },
    { status: "cancelled", cancelledAt: new Date() },
    { returnDocument: "after" }
  );
  if (!registration) {
    fail(res, 404, "Active registration not found");
  }

  res.json(registration);
};

// GET /api/sessions/registrations/my  (sirf attendee): apni session registrations
export const getMySessionRegistrations = async (req, res) => {
  const registrations = await SessionRegistration.find({ attendeeId: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "sessionId",
      select: "title type startTime endTime location eventId",
      populate: { path: "eventId", select: "name" }
    });

  res.json(registrations);
};

// GET /api/sessions/:id/registrations  (sirf admin): ek session ke registered attendees
// Filter: ?status=registered
export const getSessionRegistrations = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  const filter = { sessionId: req.params.id };
  if (req.query.status !== undefined) {
    if (!REGISTRATION_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  const sessionExists = await Session.exists({ _id: req.params.id });
  if (!sessionExists) {
    fail(res, 404, "Session not found");
  }

  const registrations = await SessionRegistration.find(filter)
    .sort({ createdAt: -1 })
    .populate("attendeeId", "name email");

  res.json(registrations);
};
