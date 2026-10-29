// Sab paths ek jagah. Links aur redirects mein inhi ko use karein, "/login" seedha na likhein.
// Yeh alag file is liye hai ke pages aur routes.js ek doosre ko import na karein (circular import na bane)
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  events: "/events",
  eventDetail: "/events/:id",
  exhibitors: "/exhibitors",
  exhibitorDetail: "/exhibitors/:id",
  myRegistrations: "/my-registrations",
  myCompany: "/my-company",
  adminEvents: "/admin/events",
  adminExhibitors: "/admin/exhibitors",
  adminBooths: "/admin/events/:id/booths",
  adminBookings: "/admin/bookings",
  myBookings: "/my-bookings",
  mySchedule: "/my-schedule",
  adminSessions: "/admin/events/:id/sessions",
  messages: "/messages",
  adminInbox: "/admin/inbox"
};

// Kisi ek event ka asli link banane ke liye: eventPath("abc123") -> "/events/abc123"
export const eventPath = (id) => `/events/${id}`;

// Kisi ek exhibitor ka asli link: exhibitorPath("abc123") -> "/exhibitors/abc123"
export const exhibitorPath = (id) => `/exhibitors/${id}`;

// Kisi event ke booths ka admin page: adminBoothsPath("abc123") -> "/admin/events/abc123/booths"
export const adminBoothsPath = (id) => `/admin/events/${id}/booths`;


// Kisi event ke sessions ka admin page: adminSessionsPath("abc123") -> "/admin/events/abc123/sessions"
export const adminSessionsPath = (id) => `/admin/events/${id}/sessions`;
