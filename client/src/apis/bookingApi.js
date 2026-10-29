import api from "./api";

// Backend: POST /api/bookings  (sirf exhibitor)  body: { boothId }  ->  nayi booking (status "confirmed")
// Company ka profile aur approval zaroori hai. Event upcoming ho aur booth available
export const createBooking = (boothId) => api.post("/bookings", { boothId });

// Backend: GET /api/bookings/my  (sirf exhibitor)  ->  [booking, ...]  (naye pehle)
// boothId: { boothNumber, location, size, price }, eventId: { name, startDate, endDate, location } (populated)
export const getMyBookings = () => api.get("/bookings/my");

// Backend: GET /api/bookings  (sirf admin)  ->  [booking, ...]  (naye pehle)
// Upar ke saath exhibitorId: { companyName, phone } bhi aata hai
// params: { status: "confirmed" | "cancelled" }, { eventId } optional
export const getAllBookings = (params) => api.get("/bookings", { params });

// Backend: PUT /api/bookings/:id/cancel  (exhibitor apni, admin koi bhi)  ->  cancelled booking
// Booth dobara available ho jata hai. Pehle se cancelled par 404 "Active booking not found"
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

