import api from "./api";

// Backend: GET /api/sessions  (public)  ->  [session, ...]  (shuru hone ke waqt ke hisaab se)
// params: { eventId } aur/ya { type: "session" | "workshop" }
export const getSessions = (params) => api.get("/sessions", { params });

// ---------- Sirf attendee ke liye (token zaroori) ----------

// Backend: GET /api/sessions/bookmarks/my  ->  [{ _id, sessionId: { _id, title, type, startTime, endTime, location, eventId: { _id, name } } }, ...]
// Session baad mein delete ho jaye to sessionId null aata hai
export const getMyBookmarks = () => api.get("/sessions/bookmarks/my");

// Backend: POST /api/sessions/:id/bookmark  ->  bookmark. Dobara lagane par 409 "You have already bookmarked this session"
export const addBookmark = (sessionId) => api.post(`/sessions/${sessionId}/bookmark`);

// Backend: DELETE /api/sessions/:id/bookmark  ->  { message }. Bookmark na ho to 404
export const removeBookmark = (sessionId) => api.delete(`/sessions/${sessionId}/bookmark`);

// Backend: GET /api/sessions/registrations/my  ->  [{ _id, status: "registered" | "cancelled", sessionId: { ...upar jaisa } }, ...]
export const getMySessionRegistrations = () => api.get("/sessions/registrations/my");

// Backend: POST /api/sessions/:id/register
// Pehle us event mein register hona zaroori (403 "Register for the event first"), shuru ho chuke session par 409
export const registerForSession = (sessionId) => api.post(`/sessions/${sessionId}/register`);

// Backend: DELETE /api/sessions/:id/register  ->  cancelled registration. Cancel ke baad dobara register ho sakta hai
export const cancelSessionRegistration = (sessionId) => api.delete(`/sessions/${sessionId}/register`);

// ---------- Sirf admin ke liye (token zaroori) ----------

// Backend: POST /api/sessions  body: { eventId, title, description, type, startTime, endTime, location }
// Session event ki dates ke andar honi chahiye (warna 400), aur endTime startTime ke baad
export const createSession = (data) => api.post("/sessions", data);

// Backend: PUT /api/sessions/:id  ->  update hui session (eventId badla nahi ja sakta)
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);

// Backend: DELETE /api/sessions/:id  ->  { message }
export const deleteSession = (id) => api.delete(`/sessions/${id}`);