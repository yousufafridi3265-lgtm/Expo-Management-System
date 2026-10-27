import api from "./api";

// Backend: POST /api/exhibitors  (sirf exhibitor, token zaroori)
// body: { companyName, phone, address, category, description }  ->  naya profile (status "pending")
export const createExhibitorProfile = (data) => api.post("/exhibitors", data);

// Backend: GET /api/exhibitors  (public)  ->  [exhibitor, ...]  (sirf approved, companyName ke hisaab se sorted)
// params: { search } company ya product ke naam se, { category } bilkul wohi category (chhote/bare harf matter karte hain)
export const getExhibitors = (params) => api.get("/exhibitors", { params });

// Backend: GET /api/exhibitors/:id  (public)  ->  exhibitor  (approved na ho to 404, galat id par 400)
export const getExhibitorById = (id) => api.get(`/exhibitors/${id}`);