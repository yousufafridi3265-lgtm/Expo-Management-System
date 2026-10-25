import SessionBookmark from "../models/SessionBookmark.js";
import Session from "../models/Session.js";
import { fail, checkValidId, applyFields, failOnDuplicate } from "../utils/fail.js";

// POST /api/sessions/:id/bookmark  (sirf attendee): session bookmark karna
export const addBookmark = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  const sessionExists = await Session.exists({ _id: req.params.id });
  if (!sessionExists) {
    fail(res, 404, "Session not found");
  }

  // attendeeId token se aati hai. Dobara bookmark karne par unique index duplicate error deta hai
  try {
    const bookmark = await SessionBookmark.create({
      sessionId: req.params.id,
      attendeeId: req.user._id
    });
    res.status(201).json(bookmark);
  } catch (error) {
    failOnDuplicate(res, error, "You have already bookmarked this session");
  }
};

// DELETE /api/sessions/:id/bookmark  (sirf attendee): bookmark hatana
export const removeBookmark = async (req, res) => {
  checkValidId(res, req.params.id, "session");

  // attendeeId filter mein hai, is liye attendee sirf apna bookmark hata sakta hai
  const bookmark = await SessionBookmark.findOneAndDelete({
    sessionId: req.params.id,
    attendeeId: req.user._id
  });
  if (!bookmark) {
    fail(res, 404, "Bookmark not found");
  }

  res.json({ message: "Bookmark removed" });
};

// GET /api/sessions/bookmarks/my  (sirf attendee): apne bookmarked sessions
export const getMyBookmarks = async (req, res) => {
  const bookmarks = await SessionBookmark.find({ attendeeId: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "sessionId",
      select: "title type startTime endTime location eventId",
      populate: { path: "eventId", select: "name" }
    });

  res.json(bookmarks);
};
