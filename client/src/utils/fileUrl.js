// Backend logo ka path deta hai, jaise "/uploads/logos/abc.png". Yeh /api ke andar nahi, server ke root par hai.
// Isliye VITE_API_URL (http://localhost:5000/api) se sirf server ka address (http://localhost:5000) lete hain
export const getFileUrl = (path) => {
  if (!path) return "";
  return `${new URL(import.meta.env.VITE_API_URL).origin}${path}`;
};
