import api from "./api";

// Backend: POST /api/registrations  (sirf attendee)  body: { eventId }  ->  registration
// Event "upcoming" na ho to 409, pehle se register ho to 409
export const createRegistration = (eventId) => api.post("/registrations", { eventId });

// Backend: GET /api/registrations/my  (sirf attendee)  ->  [registration, ...]
// Har registration mein eventId ek object hota hai: { _id, name, startDate, endDate, location, status }
export const getMyRegistrations = () => api.get("/registrations/my");

// Backend: PUT /api/registrations/:id/cancel  (sirf attendee, apni registration)  ->  registration
export const cancelRegistration = (id) => api.put(`/registrations/${id}/cancel`);