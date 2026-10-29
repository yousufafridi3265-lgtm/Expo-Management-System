import api from "./api";

// POST /api/messages (exhibitor/attendee): { subject, message, eventId (optional) }
export const createMessage = (data) => api.post("/messages", data);

// GET /api/messages/my: apni inquiries (naye pehle), eventId { _id, name } ke saath
export const getMyMessages = () => api.get("/messages/my");

// GET /api/messages (admin): params { status: "open" | "replied" }
// senderId { _id, name, email, role } ke saath (user delete ho to null)
export const getAllMessages = (params) => api.get("/messages", { params });

// PUT /api/messages/:id/reply (admin): { reply }. Pehle se replied ho to 409
export const replyToMessage = (id, reply) => api.put(`/messages/${id}/reply`, { reply });