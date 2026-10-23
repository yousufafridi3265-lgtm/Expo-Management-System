import Event from "../models/Event.js";
import Booth from "../models/Booth.js";
import { fail } from "../utils/fail.js";

// Sirf yeh fields admin se li jati hain. createdBy kabhi body se nahi aata
const pickEventFields = (body) => {
  const { name, description, startDate, endDate, location, status } = body;
  return { name, description, startDate, endDate, location, status };
};

// GET /api/events  (public)
// Optional filter: /api/events?status=upcoming
export const getEvents = async (req, res) => {
  const filter = {};
  if (typeof req.query.status === "string") {
    filter.status = req.query.status;
  }

  const events = await Event.find(filter).sort({ startDate: 1 });
  res.json(events);
};

// GET /api/events/:id  (public)
export const getEventById = async (req, res) => {
  checkValidId(res, req.params.id, "event");

  const event = await Event.findById(req.params.id);
  if (!event) {
    fail(res, 404, "Event not found");
  }

  res.json(event);
};

// POST /api/events  (sirf admin)
export const createEvent = async (req, res) => {
  const fields = pickEventFields(req.body);

  // Baqi validation (required fields, dates) Event model khud karta hai
  const event = await Event.create({ ...fields, createdBy: req.user._id });
  res.status(201).json(event);
};

// PUT /api/events/:id  (sirf admin)
export const updateEvent = async (req, res) => {
  checkValidId(res, req.params.id, "event");

  const event = await Event.findById(req.params.id);
  if (!event) {
    fail(res, 404, "Event not found");
  }

  // Sirf wahi fields badlein jo request mein aayi hain
  applyFields(event, pickEventFields(req.body));

  // save() par model ke validation phir se chalte hain
  const updatedEvent = await event.save();
  res.json(updatedEvent);
};

// DELETE /api/events/:id  (sirf admin)
export const deleteEvent = async (req, res) => {
  checkValidId(res, req.params.id, "event");

  // Booths wale event ko delete karne se booths aur bookings be-maqsad reh jate hain
  const hasBooths = await Booth.exists({ eventId: req.params.id });
  if (hasBooths) {
    fail(res, 409, "Delete this event's booths first");
  }

  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    fail(res, 404, "Event not found");
  }

  res.json({ message: "Event deleted successfully" });
};