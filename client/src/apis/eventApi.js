import api from "./api";

// Backend: GET /api/events  (public)  ->  [event, ...]  (start date ke hisaab se sorted, pagination nahi)
// params: { status: "upcoming" | "ongoing" | "completed" | "cancelled" } optional
export const getEvents = (params) => api.get("/events", { params });

// Backend: GET /api/events/:id  (public)  ->  event   (galat id par 400, na mile to 404)
export const getEventById = (id) => api.get(`/events/${id}`);

