import multer from "multer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { fail } from "./fail.js";

// Logos yahan save hote hain: server/uploads/logos
export const LOGOS_DIR = fileURLToPath(new URL("../uploads/logos", import.meta.url));

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB

// Multer file ko pehle memory mein rakhta hai. Check pass hone ke baad hi disk par likhte hain
// Form mein file ka field name "logo" hona chahiye
export const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOGO_SIZE, files: 1 }
}).single("logo");

// File ke shuru ke bytes dekh kar asli type pehchante hain.
// Naam ya extension par bharosa nahi karte, kyunke woh koi bhi badal sakta hai
const detectImageType = (buffer) => {
  if (buffer.length < 12) return null;

  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpg) return "jpg";

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngSignature)) return "png";

  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (isWebp) return "webp";

  return null;
};

// Logo check karta hai, random naam se save karta hai, aur URL path wapas karta hai
export const saveLogo = async (res, file) => {
  if (!file) {
    fail(res, 400, "Logo file is required (field name: logo)");
  }

  const type = detectImageType(file.buffer);
  if (!type) {
    fail(res, 400, "Logo must be a JPG, PNG or WEBP image");
  }

  // User ka diya hua naam use nahi karte, apna random naam banate hain
  const fileName = `${crypto.randomUUID()}.${type}`;
  await fs.mkdir(LOGOS_DIR, { recursive: true });
  await fs.writeFile(path.join(LOGOS_DIR, fileName), file.buffer);

  return `/uploads/logos/${fileName}`;
};

// Purana logo disk se hatata hai (jab naya upload ho)
export const deleteLogo = async (logoPath) => {
  if (!logoPath) return;

  try {
    // path.basename se sirf file ka naam liya jata hai, folder se bahar nahi ja sakte
    await fs.unlink(path.join(LOGOS_DIR, path.basename(logoPath)));
  } catch (error) {
    // File pehle se na ho to koi masla nahi
  }
};