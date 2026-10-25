import Booking from "../models/Booking.js";
import Booth from "../models/Booth.js";
import Event from "../models/Event.js";
import Exhibitor from "../models/Exhibitor.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";

const BOOKING_STATUSES = ["confirmed", "cancelled"];

// Booking ke saath booth aur event ki zaroori details bhi dikhane ke liye
const withDetails = (query) =>
  query.populate("boothId", "boothNumber location size price")
    .populate("eventId", "name startDate endDate location");

// POST /api/bookings  (sirf exhibitor): booth book karna. Body: { "boothId": "..." }
export const createBooking = async (req, res) => {
  const { boothId } = req.body;
  checkValidId(res, boothId, "booth");

  // Exhibitor ka profile hona chahiye, aur admin ne approve kiya hona chahiye
  const exhibitor = await Exhibitor.findOne({ userId: req.user._id });
  if (!exhibitor) {
    fail(res, 404, "Create your company profile first");
  }
  if (exhibitor.approvalStatus !== "approved") {
    fail(res, 403, "Your company must be approved before booking a booth");
  }

  const booth = await Booth.findById(boothId);
  if (!booth) {
    fail(res, 404, "Booth not found");
  }

  // Event ki id booth se aati hai (client se nahi). Sirf upcoming event ke booth book hote hain
  const event = await Event.findById(booth.eventId);
  if (!event || event.status !== "upcoming") {
    fail(res, 409, "This event is not open for booking");
  }

  // Yeh sirf jaldi ka friendly check hai. Asli hifazat neeche database ke unique index se hoti hai
  if (booth.status !== "available") {
    fail(res, 409, "This booth is not available");
  }

  // Kadam 1: booking likhna. Agar do log ek saath yahan pohanchein, to database ka unique index
  // sirf ek ko guzarta hai, doosre ko duplicate key error (11000) milta hai
  let booking;
  try {
    booking = await Booking.create({
      eventId: booth.eventId,
      boothId: booth._id,
      exhibitorId: exhibitor._id
    });
  } catch (error) {
    if (error.code === 11000) {
      fail(res, 409, "This booth has just been booked by someone else");
    }
    throw error;
  }

  // Kadam 2: booth ka status "booked" karna. Condition aur update ek hi database step mein hain
  const bookedBooth = await Booth.findOneAndUpdate(
    { _id: booth._id, status: "available" },
    { status: "booked" }
  );

  // Agar admin ne is beech booth band kar diya ho, to apni abhi banayi hui booking wapas le lete hain
  if (!bookedBooth) {
    await Booking.findByIdAndDelete(booking._id);
    fail(res, 409, "This booth is not available");
  }

  res.status(201).json(booking);
};

// GET /api/bookings/my  (sirf exhibitor): apni bookings aur unka status
export const getMyBookings = async (req, res) => {
  const exhibitor = await Exhibitor.findOne({ userId: req.user._id });
  if (!exhibitor) {
    return res.json([]);
  }

  const bookings = await withDetails(
    Booking.find({ exhibitorId: exhibitor._id }).sort({ createdAt: -1 })
  );

  res.json(bookings);
};

// GET /api/bookings  (sirf admin): sab bookings
// Filters: ?eventId=...  aur  ?status=confirmed
export const getAllBookings = async (req, res) => {
  const filter = {};

  if (req.query.eventId !== undefined) {
    checkValidId(res, req.query.eventId, "event");
    filter.eventId = req.query.eventId;
  }

  if (req.query.status !== undefined) {
    if (!BOOKING_STATUSES.includes(req.query.status)) {
      fail(res, 400, "Invalid status filter");
    }
    filter.status = req.query.status;
  }

  const bookings = await withDetails(Booking.find(filter).sort({ createdAt: -1 })).populate(
    "exhibitorId",
    "companyName phone"
  );

  res.json(bookings);
};

// PUT /api/bookings/:id/cancel  (exhibitor apni, ya admin koi bhi)
export const cancelBooking = async (req, res) => {
  checkValidId(res, req.params.id, "booking");

  // Sirf confirmed booking cancel ho sakti hai
  const filter = { _id: req.params.id, status: "confirmed" };

  // Exhibitor sirf apni booking cancel kar sakta hai. Dusre ki booking use "not found" lagti hai
  if (req.user.role === "exhibitor") {
    const exhibitor = await Exhibitor.findOne({ userId: req.user._id });
    if (!exhibitor) {
      fail(res, 404, "Active booking not found");
    }
    filter.exhibitorId = exhibitor._id;
  }

  // Kadam 1: booking cancel. Is se booth ka unique index khali ho jata hai
  const booking = await Booking.findOneAndUpdate(
    filter,
    { status: "cancelled", cancelledAt: new Date() },
    { returnDocument: "after" }
  );
  if (!booking) {
    fail(res, 404, "Active booking not found");
  }

  // Kadam 2: booth dobara available
  await Booth.updateOne({ _id: booking.boothId, status: "booked" }, { status: "available" });

  res.json(booking);
};