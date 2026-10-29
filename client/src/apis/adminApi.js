import api from "./api";

// Backend: GET /api/exhibitors/admin/all  (sirf admin)  ->  [exhibitor, ...]  (naye pehle)
// Har exhibitor mein userId ek object hota hai: { _id, name, email }
// params: { approvalStatus: "pending" | "approved" | "rejected" } optional
export const getAdminExhibitors = (params) => api.get("/exhibitors/admin/all", { params });

// Backend: PUT /api/exhibitors/:id/status  (sirf admin)  body: { approvalStatus }  ->  update hua exhibitor
export const updateExhibitorStatus = (id, approvalStatus) => api.put(`/exhibitors/${id}/status`, { approvalStatus });

// Backend: GET /api/admin/stats  (sirf admin)  ->  har cheez ka { total, ...har value ki ginti }
// users{admin,exhibitor,attendee}, events{upcoming,ongoing,completed,cancelled}, exhibitors{pending,approved,rejected},
// booths{available,booked,unavailable}, bookings{confirmed,cancelled}, eventRegistrations{registered,cancelled},
// sessions{total}, sessionRegistrations{registered,cancelled}, messages{open,replied}, feedback{new,reviewed}
export const getAdminStats = () => api.get("/admin/stats");