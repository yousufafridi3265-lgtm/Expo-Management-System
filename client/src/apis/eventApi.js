import api from "./api";

// Backend: GET /api/events  (public)  ->  [event, ...]  (start date ke hisaab se sorted, pagination nahi)
// params: { status: "upcoming" | "ongoing" | "completed" | "cancelled" } optional
export const getEvents = (params) => api.get("/events", { params });

// Backend: GET /api/events/:id  (public)  ->  event   (galat id par 400, na mile to 404)
export const getEventById = (id) => api.get(`/events/${id}`);


// Neeche ke teeno sirf admin ke liye hain (token zaroori).
// Backend: POST /api/events  body: { name, description, startDate, endDate, location, status }  ->  naya event
export const createEvent = (data) => api.post("/events", data);

// Backend: PUT /api/events/:id  ->  update hua event
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);

// Backend: DELETE /api/events/:id  ->  { message }
// Booths, sessions ya registrations wala event delete nahi hota (409), backend ka message toast mein dikhta hai
export const deleteEvent = (id) => api.delete(`/events/${id}`);


