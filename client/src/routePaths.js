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
  myRegistrations: "/my-registrations"
};

// Kisi ek event ka asli link banane ke liye: eventPath("abc123") -> "/events/abc123"
export const eventPath = (id) => `/events/${id}`;

// Kisi ek exhibitor ka asli link: exhibitorPath("abc123") -> "/exhibitors/abc123"
export const exhibitorPath = (id) => `/exhibitors/${id}`;
