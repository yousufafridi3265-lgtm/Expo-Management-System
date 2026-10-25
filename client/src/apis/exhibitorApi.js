import api from "./api";

// Backend: POST /api/exhibitors  (sirf exhibitor, token zaroori)
// body: { companyName, phone, address, category, description }  ->  naya profile (status "pending")
export const createExhibitorProfile = (data) => api.post("/exhibitors", data);