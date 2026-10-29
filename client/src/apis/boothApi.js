import api from "./api";

// Backend: GET /api/booths  (public)  ->  [booth, ...]  (booth number ke hisaab se, "A2" "A10" se pehle)
// params: { eventId } aur/ya { status: "available" | "booked" | "unavailable" }
export const getBooths = (params) => api.get("/booths", { params });

// Neeche ke teeno sirf admin ke liye hain (token zaroori).
// Backend: POST /api/booths  body: { eventId, boothNumber, location, size, price, status }  ->  naya booth
// status sirf "available" ya "unavailable" ho sakta hai ("booked" sirf booking se lagta hai)
export const createBooth = (data) => api.post("/booths", data);

// Backend: PUT /api/booths/:id  ->  update hua booth. Booked booth par 409. eventId badla nahi ja sakta
export const updateBooth = (id, data) => api.put(`/booths/${id}`, data);

// Backend: DELETE /api/booths/:id  ->  { message }. Booked booth par 409
export const deleteBooth = (id) => api.delete(`/booths/${id}`);