// protect ke baad use hota hai: sirf allowed roles ko aage jane deta hai
// Misal: router.post("/", protect, authorizeRoles("admin"), createEvent)
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You do not have permission to do this");
  }
  next();
};


