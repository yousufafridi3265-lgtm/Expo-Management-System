import api from "./api";

// Backend: POST /api/auth/register  body: { name, email, password, role }  ->  { token, user }
export const registerUser = (data) => api.post("/auth/register", data);

// Backend: POST /api/auth/login  body: { email, password }  ->  { token, user }
export const loginUser = (data) => api.post("/auth/login", data);

// Backend: GET /api/auth/me  (token zaroori)  ->  { user }
export const getCurrentUser = () => api.get("/auth/me");

