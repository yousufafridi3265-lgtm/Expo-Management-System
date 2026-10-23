// Jab koi route nahi milta to yeh 404 error banata hai
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Poori app ke errors yahan se ek jaisi shakal mein wapas jate hain
export const errorHandler = (err, req, res, next) => {
  // Mongoose ke aam errors ko sahi status code dete hain
  if (err.name === "ValidationError") res.status(400);
  // Multer ke errors, jaise file bohat bari ho
  if (err.name === "MulterError") res.status(400);
  if (err.code === 11000) {
    res.status(409);
    err.message = "Duplicate value: this record already exists";
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};