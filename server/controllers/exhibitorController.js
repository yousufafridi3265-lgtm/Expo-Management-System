import Exhibitor from "../models/Exhibitor.js";
import { fail } from "../utils/fail.js";
import { saveLogo, deleteLogo } from "../utils/upload.js";

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];

// Exhibitor sirf yeh fields khud badal sakta hai. userId, logo aur approvalStatus is list mein nahi
const pickProfileFields = (body) => {
  const { companyName, phone, address, description, category, products } = body;
  return { companyName, phone, address, description, category, products };
};

// products agar bheje jayein to list honi chahiye
const checkProducts = (res, products) => {
  if (products !== undefined && !Array.isArray(products)) {
    fail(res, 400, "Products must be a list");
  }
};

// Search text ke special characters (jaise . ya *) ko normal text bana deta hai
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Logged-in exhibitor ka apna profile dhoondta hai. Na mile to 404
const findMyProfile = async (req, res) => {
  const exhibitor = await Exhibitor.findOne({ userId: req.user._id });
  if (!exhibitor) {
    fail(res, 404, "Company profile not created yet");
  }
  return exhibitor;
};

// POST /api/exhibitors  (sirf exhibitor): apna company profile banana
export const createExhibitor = async (req, res) => {
  checkProducts(res, req.body.products);

  const alreadyHasProfile = await Exhibitor.findOne({ userId: req.user._id });
  if (alreadyHasProfile) {
    fail(res, 409, "You already have a company profile");
  }

  // userId token se aati hai, body se nahi. approvalStatus hamesha pending se shuru hota hai
  const exhibitor = await Exhibitor.create({
    ...pickProfileFields(req.body),
    userId: req.user._id
  });

  res.status(201).json(exhibitor);
};

// GET /api/exhibitors/my  (sirf exhibitor): apna profile aur approval status dekhna
export const getMyExhibitor = async (req, res) => {
  const exhibitor = await findMyProfile(req, res);
  res.json(exhibitor);
};

// PUT /api/exhibitors/my  (sirf exhibitor): apna profile update karna
export const updateMyExhibitor = async (req, res) => {
  checkProducts(res, req.body.products);

  const exhibitor = await findMyProfile(req, res);
  applyFields(exhibitor, pickProfileFields(req.body));

  const updatedExhibitor = await exhibitor.save();
  res.json(updatedExhibitor);
};

// PUT /api/exhibitors/my/logo  (sirf exhibitor): logo upload karna
export const uploadMyLogo = async (req, res) => {
  const exhibitor = await findMyProfile(req, res);

  // Pehle file check hoti hai aur save hoti hai, phir database update hota hai
  const newLogo = await saveLogo(res, req.file);
  const oldLogo = exhibitor.logo;

  exhibitor.logo = newLogo;
  await exhibitor.save();
  await deleteLogo(oldLogo);

  res.json(exhibitor);
};

// GET /api/exhibitors  (public): sirf approved exhibitors
// Filters: ?search=ali (company ya product ke naam se) aur ?category=food
export const getExhibitors = async (req, res) => {
  const filter = { approvalStatus: "approved" };

  if (typeof req.query.category === "string" && req.query.category) {
    filter.category = req.query.category;
  }

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    const pattern = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ companyName: pattern }, { "products.name": pattern }];
  }

  // userId public response mein nahi bhejte
  const exhibitors = await Exhibitor.find(filter).select("-userId").sort({ companyName: 1 });
  res.json(exhibitors);
};

// GET /api/exhibitors/:id  (public): sirf approved exhibitor
export const getExhibitorById = async (req, res) => {
  checkValidId(res, req.params.id, "exhibitor");

  const exhibitor = await Exhibitor.findOne({
    _id: req.params.id,
    approvalStatus: "approved"
  }).select("-userId");

  if (!exhibitor) {
    fail(res, 404, "Exhibitor not found");
  }

  res.json(exhibitor);
};

// GET /api/exhibitors/admin/all  (sirf admin): sab exhibitors, user ke naam aur email ke saath
// Filter: ?approvalStatus=pending
export const getAllExhibitorsForAdmin = async (req, res) => {
  const filter = {};
  if (APPROVAL_STATUSES.includes(req.query.approvalStatus)) {
    filter.approvalStatus = req.query.approvalStatus;
  }

  const exhibitors = await Exhibitor.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(exhibitors);
};

// PUT /api/exhibitors/:id/status  (sirf admin): approve ya reject karna
export const updateApprovalStatus = async (req, res) => {
  checkValidId(res, req.params.id, "exhibitor");

  const { approvalStatus } = req.body;
  if (!APPROVAL_STATUSES.includes(approvalStatus)) {
    fail(res, 400, "approvalStatus must be pending, approved or rejected");
  }

  const exhibitor = await Exhibitor.findByIdAndUpdate(
    req.params.id,
    { approvalStatus },
    { returnDocument: "after" }
  );
  if (!exhibitor) {
    fail(res, 404, "Exhibitor not found");
  }

  res.json(exhibitor);
};

