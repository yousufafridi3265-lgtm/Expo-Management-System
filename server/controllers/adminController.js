import User from "../models/User.js";
import Event from "../models/Event.js";
import Exhibitor from "../models/Exhibitor.js";
import Booth from "../models/Booth.js";
import Booking from "../models/Booking.js";
import EventRegistration from "../models/EventRegistration.js";
import Session from "../models/Session.js";
import SessionRegistration from "../models/SessionRegistration.js";
import Message from "../models/Message.js";
import Feedback from "../models/Feedback.js";

// Ek model ke records ko ek field ki har value ke hisaab se ginta hai.
// Misal: Booth ko "status" se -> { total: 10, available: 6, booked: 3, unavailable: 1 }
// Allowed values model ke enum se aati hain, is liye list dobara nahi likhni parti
const countByField = async (Model, field) => {
  const allowedValues = Model.schema.path(field).enumValues;
  const rows = await Model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);

  const counts = {};
  allowedValues.forEach((value) => {
    counts[value] = 0;
  });

  let total = 0;
  rows.forEach((row) => {
    total += row.count;
    if (row._id in counts) {
      counts[row._id] = row.count;
    }
  });

  return { total, ...counts };
};

// GET /api/admin/stats  (sirf admin): dashboard ke liye ginti
export const getDashboardStats = async (req, res) => {
  // Sab ginti ek saath nikalte hain, is liye jawab jaldi aata hai
  const [ users, events, exhibitors, booths, bookings, eventRegistrations, sessionCount, sessionRegistrations, messages, feedback] = await Promise.all([
    countByField(User, "role"), countByField(Event, "status"),
    countByField(Exhibitor, "approvalStatus"), countByField(Booth, "status"),
    countByField(Booking, "status"), countByField(EventRegistration, "status"),
    Session.countDocuments(), countByField(SessionRegistration, "status"),
    countByField(Message, "status"), countByField(Feedback, "status")
  ]);

  res.json({ users, events, exhibitors, booths, bookings, eventRegistrations, sessions: { total: sessionCount }, sessionRegistrations, messages, feedback });
};
