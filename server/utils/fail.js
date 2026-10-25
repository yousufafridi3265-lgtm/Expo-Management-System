import mongoose from "mongoose";
export const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

export const checkValidId = (res, id, label = "item") => {
  if (!mongoose.isValidObjectId(id)) {
    fail(res, 400, `Invalid ${label} id`);
  }
};

export const applyFields = (document, fields) => {
  Object.keys(fields).forEach((key) => {
    if (fields[key] !== undefined) {
      document[key] = fields[key];
    }
  });
};


// create() ke catch block mein use hota hai.
// Agar error "duplicate key" (11000) hai, yani database ka unique index tak gaya, to 409 deta hai.
// Koi aur error ho to usay jaisa hai waisa aage bhej deta hai
export const failOnDuplicate = (res, error, message) => {
  if (error.code === 11000) {
    fail(res, 409, message);
  }
  throw error;
};