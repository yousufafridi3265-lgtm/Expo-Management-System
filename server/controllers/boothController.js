import Booth from "../models/Booth.js";
import Event from "../models/Event.js";
import { fail } from "../utils/fail.js";

const ALL_STATUSES = ["available", "booked", "unavailable"];
// Admin sirf yeh do status khud laga sakta hai. "booked" sirf Booking module lagayega
const ADMIN_STATUSES = ["available", "unavailable"];

// Admin se sirf yeh fields li jati hain. eventId update mein shamil nahi (booth event nahi badalta)
const pickBoothFields = (body) => {
  const { boothNumber, location, size, price, status } = body;
  return { boothNumber, location, size, price, status };
};

const checkAdminStatus = (res, status) => {
  if (status !== undefined && !ADMIN_STATUSES.includes(status)) {
    fail(res, 400, "Status must be available or unavailable");
  }
};

// Jab booked booth badalne ya delete karne par update/delete na ho paye,
// to dekhta hai ke booth hai hi nahi (404) ya booked hai (409)
const failNotFoundOrBooked = async (res, id) => {
  const boothExists = await Booth.exists({ _id: id });
  if (!boothExists) {
    fail(res, 404, "Booth not found");
  }
  fail(res, 409, "A booked booth cannot be changed or deleted");
};

// GET /api/booths  (public)
// Filters: ?eventId=...  aur  ?status=available
export const getBooths = async (req, res) => {
  const filter = {};

  if (req.query.eventId !== undefined) {
    checkValidId(res, req.query.eventId, "event");
    filter.eventId = req.query.eventId;
  }

  if (req.query.status !== undefined) {
    if (!ALL_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  // numericOrdering ki wajah se "A2" "A10" se pehle aata hai
  const booths = await Booth.find(filter)
    .sort({ boothNumber: 1 })
    .collation({ locale: "en", numericOrdering: true });

  res.json(booths);
};

// GET /api/booths/:id  (public)
export const getBoothById = async (req, res) => {
  checkValidId(res, req.params.id, "booth");

  const booth = await Booth.findById(req.params.id);
  if (!booth) {
    fail(res, 404, "Booth not found");
  }

  res.json(booth);
};

// POST /api/booths  (sirf admin)
export const createBooth = async (req, res) => {
  const { eventId } = req.body;
  checkValidId(res, eventId, "event");
  checkAdminStatus(res, req.body.status);

  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) {
    fail(res, 404, "Event not found");
  }

  // Baqi validation (required fields, price) aur duplicate booth number model/database sambhalta hai
  const booth = await Booth.create({ ...pickBoothFields(req.body), eventId });
  res.status(201).json(booth);
};

// PUT /api/booths/:id  (sirf admin)
export const updateBooth = async (req, res) => {
  checkValidId(res, req.params.id, "booth");
  checkAdminStatus(res, req.body.status);

  const updates = {};
  applyFields(updates, pickBoothFields(req.body));
  if (Object.keys(updates).length === 0) {
    fail(res, 400, "Nothing to update");
  }

  // Yeh ek hi database step mein check bhi karta hai ke booth booked to nahi, aur update bhi karta hai.
  // Is tarah admin ka update aur kisi ki booking ek saath takra kar galti nahi kar sakte
  const booth = await Booth.findOneAndUpdate(
    { _id: req.params.id, status: { $ne: "booked" } },
    updates,
    { returnDocument: "after", runValidators: true }
  );

  if (!booth) {
    await failNotFoundOrBooked(res, req.params.id);
  }

  res.json(booth);
};

// DELETE /api/booths/:id  (sirf admin)
export const deleteBooth = async (req, res) => {
  checkValidId(res, req.params.id, "booth");

  const booth = await Booth.findOneAndDelete({
    _id: req.params.id,
    status: { $ne: "booked" }
  });

  if (!booth) {
    await failNotFoundOrBooked(res, req.params.id);
  }

  res.json({ message: "Booth deleted successfully" });
};