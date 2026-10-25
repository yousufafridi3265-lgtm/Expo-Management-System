import { fail, checkValidId, applyFields } from "../utils/fail.js";
import Event from "../models/Event.js";
import Session from "../models/Session.js";
import SessionBookmark from "../models/SessionBookmark.js";
import SessionRegistration from "../models/SessionRegistration.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

// Admin se sirf yeh fields li jati hain. eventId update mein shamil nahi (session event nahi badalta)
const pickSessionFields = (body) => {
  const { title, description, type, startTime, endTime, location } = body;
  return { title, description, type, startTime, endTime, location };
};

// Session event ki dates ke andar honi chahiye.
// Event ki endDate sirf tareekh hoti hai (raat 12 baje), is liye aakhri din ke poore 24 ghante allowed hain
const checkInsideEvent = (res, event, session) => {
  const eventStart = event.startDate;
  const eventEnd = new Date(event.endDate.getTime() + ONE_DAY);

  if (session.startTime < eventStart || session.endTime > eventEnd) {
    fail(res, 400, "Session must be within the event dates");
  }
};

// Session ko check karke save karta hai. create aur update dono yahi use karte hain
const validateAndSave = async (res, session, event) => {
  // Pehle model ki validation (zaroori fields, galat date, end start ke baad) phir event ki dates
  await session.validate();
  checkInsideEvent(res, event, session);
  return session.save();
};

// GET /api/sessions  (public)
// Filters: ?eventId=...  aur  ?type=workshop
export const getSessions = async (req, res) => {
  const filter = {};

  if (req.query.eventId !== undefined) {
    checkValidId(res, req.query.eventId, "event");
    filter.eventId = req.query.eventId;
  }

  if (req.query.type !== undefined) {
    if (!["session", "workshop"].includes(req.query.type)) {
      fail(res, 400, "Invalid type filter");
    }
    filter.type = req.query.type;
  }

  const sessions = await Session.find(filter).sort({ startTime: 1 });
  res.json(sessions);
};

// GET /api/sessions/:id  (public)
export const getSessionById = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  const session = await Session.findById(req.params.id);
  if (!session) {
    fail(res, 404, "Session not found");
  }

  res.json(session);
};

// POST /api/sessions  (sirf admin)
export const createSession = async (req, res) => {
  const { eventId } = req.body;
  checkValidId(res, eventId, "event");

  const event = await Event.findById(eventId);
  if (!event) {
    fail(res, 404, "Event not found");
  }

  const session = new Session({ ...pickSessionFields(req.body), eventId: event._id });
  const savedSession = await validateAndSave(res, session, event);

  res.status(201).json(savedSession);
};

// PUT /api/sessions/:id  (sirf admin)
export const updateSession = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  const fields = pickSessionFields(req.body);
  const hasChanges = Object.values(fields).some((value) => value !== undefined);
  if (!hasChanges) {
    fail(res, 400, "Nothing to update");
  }

  const session = await Session.findById(req.params.id);
  if (!session) {
    fail(res, 404, "Session not found");
  }

  const event = await Event.findById(session.eventId);
  if (!event) {
    fail(res, 404, "Event not found");
  }

  applyFields(session, fields);
  const savedSession = await validateAndSave(res, session, event);

  res.json(savedSession);
};

// DELETE /api/sessions/:id  (sirf admin)
export const deleteSession = async (req, res) => {
    checkValidId(res, req.params.id, "session");

    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      fail(res, 404, "Session not found");
    }

    // Delete hue session ke bookmarks aur registrations ka koi maqsad nahi, unhein bhi hata dete hain
    await SessionBookmark.deleteMany({ sessionId: session._id });
    await SessionRegistration.deleteMany({ sessionId: session._id });

    res.json({ message: "Session deleted successfully" });
};

