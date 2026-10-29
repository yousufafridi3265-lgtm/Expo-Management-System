import api from "./api";

// POST /api/feedback (exhibitor/attendee): { subject, description }
export const createFeedback = (data) => api.post("/feedback", data);

// GET /api/feedback (admin): params { status: "new" | "reviewed" }, userId { name, email, role } ke saath
export const getAllFeedback = (params) => api.get("/feedback", { params });

// PUT /api/feedback/:id/review (admin)
export const markFeedbackReviewed = (id) => api.put(`/feedback/${id}/review`);