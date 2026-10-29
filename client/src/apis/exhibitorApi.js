import api from "./api";

// Backend: POST /api/exhibitors  (sirf exhibitor, token zaroori)
// body: { companyName, phone, address, category, description }  ->  naya profile (status "pending")
export const createExhibitorProfile = (data) => api.post("/exhibitors", data);

// Backend: GET /api/exhibitors  (public)  ->  [exhibitor, ...]  (sirf approved, companyName ke hisaab se sorted)
// params: { search } company ya product ke naam se, { category } bilkul wohi category (chhote/bare harf matter karte hain)
export const getExhibitors = (params) => api.get("/exhibitors", { params });

// Backend: GET /api/exhibitors/:id  (public)  ->  exhibitor  (approved na ho to 404, galat id par 400)
export const getExhibitorById = (id) => api.get(`/exhibitors/${id}`);


// Backend: GET /api/exhibitors/my  (sirf exhibitor)  ->  apna profile (approvalStatus samet). Profile na bana ho to 404
export const getMyExhibitorProfile = () => api.get("/exhibitors/my");

// Backend: PUT /api/exhibitors/my  (sirf exhibitor)  ->  update hua profile
// body mein sirf wohi fields bhejein jo badalni hain: companyName, phone, address, category, description, products
// (products bheje to poori list bhejni hoti hai, backend purani list badal deta hai)
export const updateMyExhibitorProfile = (data) => api.put("/exhibitors/my", data);

// Backend: PUT /api/exhibitors/my/logo  (sirf exhibitor)  ->  update hua profile (logo naye path ke saath)
// File form-data mein "logo" naam se jati hai. JPG/PNG/WEBP, 2 MB tak
export const uploadMyLogo = (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  return api.put("/exhibitors/my/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};


