// Poore backend ka test. Chalane ka tareeqa: npm run test:api
// MongoDB chalta hona chahiye. Test ek ALAG database (TEST_DB_NAME) mein chalta hai,
// aap ka asli data nahi chhuta. Test ke shuru aur aakhir mein yeh test database saaf kiya jata hai
import "dotenv/config";
import mongoose from "mongoose";
import app from "../app.js";
import { deleteLogo } from "../utils/upload.js";

const TEST_DB = process.env.TEST_DB_NAME || "expo-management-test";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI .env mein nahi mila.");
  process.exit(1);
}
// Hifazat: database ka naam "test" wala na ho to hum usay kabhi saaf nahi karenge
if (!TEST_DB.includes("test")) {
  console.error(`TEST_DB_NAME ("${TEST_DB}") mein "test" lafz hona zaroori hai.`);
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI, { dbName: TEST_DB, serverSelectionTimeoutMS: 5000 });
} catch (error) {
  console.error(`MongoDB se connect nahi ho paya: ${error.message}`);
  process.exit(1);
}

const M = mongoose.models; // app ke saare models yahan load ho chuke hain

let passed = 0;
let failed = 0;
const check = (name, got, want) => {
  const ok = String(got) === String(want);
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `   (mila: ${got}, chahiye: ${want})`}`);
};
const section = (title) => console.log(`\n=== ${title} ===`);

let baseUrl = "";
let origin = "";

// Har request ek jaisi: { status, data } wapas deta hai
const call = async (method, path, { token, body, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(baseUrl + path, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined)
  });
  const data = await response.json().catch(() => ({}));

  // 500 matlab server ke andar koi ghalti hui. Wajah yahin dikha dete hain
  if (response.status >= 500) {
    const stackLine = String(data.stack || "").split("\n").slice(1, 3).join(" | ").trim();
    console.log(`      -> SERVER ERROR ${method} ${path}: ${data.message} ${stackLine}`);
  }

  return { status: response.status, data };
};

const ghostId = "64b7f0f2a1b2c3d4e5f60718"; // kisi record ki nahi, sirf "maujood nahi" test ke liye
const pngBytes = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64)
]);
const pngForm = () => {
  const form = new FormData();
  form.append("logo", new Blob([pngBytes], { type: "image/png" }), "evil.exe");
  return form;
};

const register = async (name, email, role) =>
  (await call("POST", "/auth/register", { body: { name, email, password: "123456", role } })).data;

let admin = "";
const logosToCleanUp = [];

// Approved company wala exhibitor banata hai (booking tests ke liye)
const makeExhibitor = async (label, { approve = true } = {}) => {
  const reg = await register(`Exh ${label}`, `exh${label}@test.com`, "exhibitor");
  const profile = await call("POST", "/exhibitors", {
    token: reg.token,
    body: {
      companyName: `Company ${label}`,
      phone: "0300",
      address: "Karachi",
      category: "Technology",
      products: [{ name: `Product ${label}` }]
    }
  });
  if (approve) {
    await call("PUT", `/exhibitors/${profile.data._id}/status`, {
      token: admin,
      body: { approvalStatus: "approved" }
    });
  }
  return { token: reg.token, exhibitorId: profile.data._id };
};

const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
origin = `http://127.0.0.1:${server.address().port}`;
baseUrl = `${origin}/api`;

try {
  // Saaf database aur indexes (unique index ke baghair booking ka test bekar hai)
  await mongoose.connection.dropDatabase();
  await mongoose.syncIndexes();

  // ---------------------------------------------------------------- Auth
  section("Auth");
  const adminReg = await register("Admin", "admin@test.com", "attendee");
  await M.User.updateOne({ email: "admin@test.com" }, { role: "admin" }); // admin banane ka tareeqa: seed script jaisa
  admin = adminReg.token;
  const exA = await register("Exhibitor A", "exa@test.com", "exhibitor");
  const att = await register("Attendee One", "att1@test.com", "attendee");
  const att2 = await register("Attendee Two", "att2@test.com", "attendee");

  check("register: password hash nahi aata", "passwordHash" in att.user, false);
  check("register: role admin mana hai", (await call("POST", "/auth/register", { body: { name: "X", email: "x@test.com", password: "123456", role: "admin" } })).status, 400);
  check("register: zaroori fields", (await call("POST", "/auth/register", { body: { name: "X" } })).status, 400);
  check("register: chhota password", (await call("POST", "/auth/register", { body: { name: "X", email: "x@test.com", password: "123" } })).status, 400);
  check("register: duplicate email (capital letters)", (await call("POST", "/auth/register", { body: { name: "X", email: "ATT1@test.com", password: "123456" } })).status, 409);
  check("login theek", (await call("POST", "/auth/login", { body: { email: "att1@test.com", password: "123456" } })).status, 200);
  check("login galat password", (await call("POST", "/auth/login", { body: { email: "att1@test.com", password: "wrong" } })).status, 401);
  check("login email maujood nahi", (await call("POST", "/auth/login", { body: { email: "nobody@test.com", password: "123456" } })).status, 401);
  const me = await call("GET", "/auth/me", { token: att.token });
  check("/me", `${me.status} ${me.data.user.email} ${"passwordHash" in me.data.user}`, "200 att1@test.com false");
  check("/me bina token", (await call("GET", "/auth/me")).status, 401);
  check("/me galat token", (await call("GET", "/auth/me", { token: "abc.def.ghi" })).status, 401);
  check("role token se nahi, database se (admin)", (await call("GET", "/auth/me", { token: admin })).data.user.role, "admin");

  // ---------------------------------------------------------------- Events
  section("Events");
  const eventBody = { name: "Tech Expo", startDate: "2030-06-01", endDate: "2030-06-05", location: "Karachi" };
  check("event: attendee nahi bana sakta", (await call("POST", "/events", { token: att.token, body: eventBody })).status, 403);
  check("event: bina token", (await call("POST", "/events", { body: eventBody })).status, 401);
  const e1 = (await call("POST", "/events", { token: admin, body: eventBody })).data;
  check("event: admin bana sakta hai", e1.status, "upcoming");
  check("event: createdBy token se", String(e1.createdBy), adminReg.user.id);
  const e2 = (await call("POST", "/events", { token: admin, body: { ...eventBody, name: "Food Expo" } })).data;
  const e3 = (await call("POST", "/events", { token: admin, body: { ...eventBody, name: "Closed Expo", status: "completed" } })).data;
  const e4 = (await call("POST", "/events", { token: admin, body: { name: "Old Expo", startDate: "2020-01-01", endDate: "2020-01-03", location: "Lahore" } })).data;
  check("event: end date start se pehle", (await call("POST", "/events", { token: admin, body: { ...eventBody, endDate: "2029-01-01" } })).status, 400);
  check("event: naam ke baghair", (await call("POST", "/events", { token: admin, body: { ...eventBody, name: "" } })).status, 400);
  check("event: list public", (await call("GET", "/events")).data.length, 4);
  check("event: status filter", (await call("GET", "/events?status=completed")).data.length, 1);
  check("event: ek event", (await call("GET", `/events/${e1._id}`)).data.name, "Tech Expo");
  check("event: galat id", (await call("GET", "/events/abc")).status, 400);
  check("event: maujood nahi", (await call("GET", `/events/${ghostId}`)).status, 404);
  check("event: update", (await call("PUT", `/events/${e1._id}`, { token: admin, body: { location: "Lahore" } })).data.location, "Lahore");
  check("event: update galat dates", (await call("PUT", `/events/${e1._id}`, { token: admin, body: { endDate: "2020-01-01" } })).status, 400);
  check("event: update attendee", (await call("PUT", `/events/${e1._id}`, { token: att.token, body: { location: "X" } })).status, 403);

  // ---------------------------------------------------------------- Exhibitors
  section("Exhibitors");
  const profileBody = { companyName: "Acme Tech", phone: "0300", address: "Karachi", category: "Technology", products: [{ name: "Smart Lock" }] };
  check("profile: attendee nahi bana sakta", (await call("POST", "/exhibitors", { token: att.token, body: profileBody })).status, 403);
  check("profile: /my banne se pehle", (await call("GET", "/exhibitors/my", { token: exA.token })).status, 404);
  check("profile: products list nahi", (await call("POST", "/exhibitors", { token: exA.token, body: { ...profileBody, products: "x" } })).status, 400);
  check("profile: zaroori fields", (await call("POST", "/exhibitors", { token: exA.token, body: { companyName: "X" } })).status, 400);
  const exAProfile = await call("POST", "/exhibitors", { token: exA.token, body: { ...profileBody, approvalStatus: "approved" } });
  check("profile: bana, status zabardasti pending", `${exAProfile.status} ${exAProfile.data.approvalStatus}`, "201 pending");
  check("profile: dobara nahi", (await call("POST", "/exhibitors", { token: exA.token, body: profileBody })).status, 409);
  check("public list: pending nahi dikhta", (await call("GET", "/exhibitors")).data.length, 0);
  check("public get: pending 404", (await call("GET", `/exhibitors/${exAProfile.data._id}`)).status, 404);
  const updated = await call("PUT", "/exhibitors/my", { token: exA.token, body: { phone: "0311", approvalStatus: "approved", logo: "/hack.png" } });
  check("profile update: phone badla", updated.data.phone, "0311");
  check("profile update: approvalStatus/logo nahi badle", `${updated.data.approvalStatus} "${updated.data.logo}"`, 'pending ""');

  const logo1 = await call("PUT", "/exhibitors/my/logo", { token: exA.token, form: pngForm() });
  check("logo: upload", `${logo1.status} ${logo1.data.logo?.startsWith("/uploads/logos/")}`, "200 true");
  check("logo: file khulti hai", (await fetch(origin + logo1.data.logo)).status, 200);
  const logo2 = await call("PUT", "/exhibitors/my/logo", { token: exA.token, form: pngForm() });
  logosToCleanUp.push(logo2.data.logo);
  check("logo: purani file hat gayi", (await fetch(origin + logo1.data.logo)).status, 404);
  const fakeForm = new FormData();
  fakeForm.append("logo", new Blob(["yeh image nahi, sirf text hai"], { type: "image/png" }), "a.png");
  check("logo: nakli image", (await call("PUT", "/exhibitors/my/logo", { token: exA.token, form: fakeForm })).status, 400);
  const bigForm = new FormData();
  bigForm.append("logo", new Blob([Buffer.concat([pngBytes, Buffer.alloc(3 * 1024 * 1024)])], { type: "image/png" }), "big.png");
  check("logo: 2MB se bari", (await call("PUT", "/exhibitors/my/logo", { token: exA.token, form: bigForm })).status, 400);
  check("logo: file ke baghair", (await call("PUT", "/exhibitors/my/logo", { token: exA.token, form: new FormData() })).status, 400);
  check("logo: attendee", (await call("PUT", "/exhibitors/my/logo", { token: att.token, form: pngForm() })).status, 403);

  check("admin list: pending + user ki email", (await call("GET", "/exhibitors/admin/all?approvalStatus=pending", { token: admin })).data[0]?.userId?.email, "exa@test.com");
  check("admin list: exhibitor nahi dekh sakta", (await call("GET", "/exhibitors/admin/all", { token: exA.token })).status, 403);
  check("approve: exhibitor khud nahi", (await call("PUT", `/exhibitors/${exAProfile.data._id}/status`, { token: exA.token, body: { approvalStatus: "approved" } })).status, 403);
  check("approve: galat status", (await call("PUT", `/exhibitors/${exAProfile.data._id}/status`, { token: admin, body: { approvalStatus: "yes" } })).status, 400);
  check("approve: maujood nahi", (await call("PUT", `/exhibitors/${ghostId}/status`, { token: admin, body: { approvalStatus: "approved" } })).status, 404);
  check("approve: theek", (await call("PUT", `/exhibitors/${exAProfile.data._id}/status`, { token: admin, body: { approvalStatus: "approved" } })).data.approvalStatus, "approved");
  const publicList = await call("GET", "/exhibitors");
  check("public list: approved dikhta hai, userId nahi", `${publicList.data.length} ${"userId" in publicList.data[0]}`, "1 false");
  check("search: product ke naam se", (await call("GET", "/exhibitors?search=smart")).data.length, 1);
  check("search: company ke naam se", (await call("GET", "/exhibitors?search=acme")).data.length, 1);
  check("search: kuch nahi milta", (await call("GET", "/exhibitors?search=zzz")).data.length, 0);
  check("search: regex ke khaas characters", (await call("GET", "/exhibitors?search=.*")).data.length, 0);
  check("category filter", (await call("GET", "/exhibitors?category=Technology")).data.length, 1);
  check("category filter: koi nahi", (await call("GET", "/exhibitors?category=Food")).data.length, 0);
  check("public: ek exhibitor", (await call("GET", `/exhibitors/${exAProfile.data._id}`)).status, 200);

  // ---------------------------------------------------------------- Booths
  section("Booths");
  const booth = (number, extra = {}) => ({ eventId: e1._id, boothNumber: number, size: "3x3 m", price: 500, ...extra });
  check("booth: exhibitor nahi bana sakta", (await call("POST", "/booths", { token: exA.token, body: booth("A1") })).status, 403);
  const boothA1 = await call("POST", "/booths", { token: admin, body: booth("A1", { location: "Hall A" }) });
  check("booth: bana, default available", `${boothA1.status} ${boothA1.data.status}`, "201 available");
  check("booth: same event mein duplicate number", (await call("POST", "/booths", { token: admin, body: booth("A1") })).status, 409);
  check("booth: duplicate (extra spaces)", (await call("POST", "/booths", { token: admin, body: booth("  A1  ") })).status, 409);
  check("booth: doosre event mein wohi number", (await call("POST", "/booths", { token: admin, body: { ...booth("A1"), eventId: e2._id } })).status, 201);
  check("booth: negative price", (await call("POST", "/booths", { token: admin, body: booth("X1", { price: -5 }) })).status, 400);
  check("booth: price text", (await call("POST", "/booths", { token: admin, body: booth("X2", { price: "abc" }) })).status, 400);
  check("booth: size ke baghair", (await call("POST", "/booths", { token: admin, body: { eventId: e1._id, boothNumber: "X3", price: 1 } })).status, 400);
  check("booth: admin booked status nahi laga sakta", (await call("POST", "/booths", { token: admin, body: booth("X4", { status: "booked" }) })).status, 400);
  check("booth: galat eventId", (await call("POST", "/booths", { token: admin, body: booth("X5", { eventId: "abc" }) })).status, 400);
  check("booth: eventId number", (await call("POST", "/booths", { token: admin, body: booth("X6", { eventId: 123 }) })).status, 400);
  check("booth: event maujood nahi", (await call("POST", "/booths", { token: admin, body: booth("X7", { eventId: ghostId }) })).status, 404);
  const boothIds = { A1: boothA1.data._id };
  for (const number of ["A10", "A2", "A9"]) {
    boothIds[number] = (await call("POST", "/booths", { token: admin, body: booth(number) })).data._id;
  }
  const closedBooth = (await call("POST", "/booths", { token: admin, body: { ...booth("C1"), eventId: e3._id } })).data;
  check("booth: numeric tarteeb", (await call("GET", `/booths?eventId=${e1._id}`)).data.map((b) => b.boothNumber).join(","), "A1,A2,A9,A10");
  check("booth: doosre event ke booths", (await call("GET", `/booths?eventId=${e2._id}`)).data.length, 1);
  check("booth: galat status filter", (await call("GET", "/booths?status=zzz")).status, 400);
  check("booth: eventId array", (await call("GET", "/booths?eventId=a&eventId=b")).status, 400);
  check("booth: ek booth", (await call("GET", `/booths/${boothIds.A1}`)).status, 200);
  check("booth: price update", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { price: 900 } })).data.price, 900);
  check("booth: eventId update nahi hota", String((await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { eventId: e2._id, size: "4x4 m" } })).data.eventId), e1._id);
  check("booth: unavailable kiya", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { status: "unavailable" } })).data.status, "unavailable");
  check("booth: update mein booked nahi", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { status: "booked" } })).status, 400);
  check("booth: khali update", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: {} })).status, 400);
  check("booth: update mein duplicate number", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { boothNumber: "A2" } })).status, 409);
  check("booth: update mein price text", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { price: "abc" } })).status, 400);
  check("booth: update mein negative price", (await call("PUT", `/booths/${boothIds.A1}`, { token: admin, body: { price: -1 } })).status, 400);
  check("booth: update maujood nahi", (await call("PUT", `/booths/${ghostId}`, { token: admin, body: { price: 1 } })).status, 404);

  // ---------------------------------------------------------------- Bookings
  section("Bookings");
  const exB = await makeExhibitor("B");
  const exC = await makeExhibitor("C");
  const exPending = await makeExhibitor("Pending", { approve: false });
  const exNoProfile = await register("No Profile", "noprofile@test.com", "exhibitor");
  const book = (token, boothId) => call("POST", "/bookings", { token, body: { boothId } });

  check("booking: attendee nahi kar sakta", (await book(att.token, boothIds.A2)).status, 403);
  check("booking: bina token", (await book(undefined, boothIds.A2)).status, 401);
  check("booking: company profile ke baghair", (await book(exNoProfile.token, boothIds.A2)).status, 404);
  check("booking: company approve nahi hui", (await book(exPending.token, boothIds.A2)).status, 403);
  check("booking: galat boothId", (await book(exA.token, "abc")).status, 400);
  check("booking: booth maujood nahi", (await book(exA.token, ghostId)).status, 404);
  check("booking: unavailable booth", (await book(exA.token, boothIds.A1)).status, 409);
  check("booking: event upcoming nahi", (await book(exA.token, closedBooth._id)).status, 409);

  // Sab se zaroori test: 3 exhibitors, 12 requests ek saath, ek hi booth
  exA.exhibitorId = exAProfile.data._id; // exA ka profile pehle bana tha, id yahan jorte hain
  const racers = [exA.token, exB.token, exC.token];
  const raceResults = await Promise.all(
    Array.from({ length: 12 }, (_, i) => book(racers[i % 3], boothIds.A2).then((r) => r.status))
  );
  check("RACE: sirf ek booking jeeti (201)", raceResults.filter((s) => s === 201).length, 1);
  check("RACE: baqi 11 ko 409", raceResults.filter((s) => s === 409).length, 11);
  check("RACE: database mein ek hi confirmed booking", await M.Booking.countDocuments({ boothId: boothIds.A2, status: "confirmed" }), 1);
  check("RACE: booth ka status booked", (await call("GET", `/booths/${boothIds.A2}`)).data.status, "booked");

  const winnerBooking = await M.Booking.findOne({ boothId: boothIds.A2, status: "confirmed" });
  const winnerToken = [exA, exB, exC].find((e) => e.exhibitorId === String(winnerBooking.exhibitorId)).token;
  const loserToken = racers.find((t) => t !== winnerToken);
  const mine = await call("GET", "/bookings/my", { token: winnerToken });
  check("booking: /my mein booth ki details", `${mine.data.length} ${mine.data[0].boothId.boothNumber}`, "1 A2");
  check("booking: /my doosre ki nahi", (await call("GET", "/bookings/my", { token: loserToken })).data.length, 0);
  check("booking: admin list", (await call("GET", `/bookings?eventId=${e1._id}&status=confirmed`, { token: admin })).data[0].exhibitorId.companyName.length > 0, true);
  check("booking: admin list galat status", (await call("GET", "/bookings?status=zzz", { token: admin })).status, 400);
  check("booking: admin list exhibitor ko nahi", (await call("GET", "/bookings", { token: winnerToken })).status, 403);

  check("booked booth: update nahi hota", (await call("PUT", `/booths/${boothIds.A2}`, { token: admin, body: { price: 1 } })).status, 409);
  check("booked booth: delete nahi hota", (await call("DELETE", `/booths/${boothIds.A2}`, { token: admin })).status, 409);

  check("cancel: doosre ki booking", (await call("PUT", `/bookings/${winnerBooking._id}/cancel`, { token: loserToken })).status, 404);
  check("cancel: attendee", (await call("PUT", `/bookings/${winnerBooking._id}/cancel`, { token: att.token })).status, 403);
  check("cancel: galat id", (await call("PUT", "/bookings/abc/cancel", { token: winnerToken })).status, 400);
  check("cancel: apni booking", (await call("PUT", `/bookings/${winnerBooking._id}/cancel`, { token: winnerToken })).data.status, "cancelled");
  check("cancel: booth wapas available", (await call("GET", `/booths/${boothIds.A2}`)).data.status, "available");
  check("cancel: dobara cancel", (await call("PUT", `/bookings/${winnerBooking._id}/cancel`, { token: winnerToken })).status, 404);
  const rebooked = await book(loserToken, boothIds.A2);
  check("cancel ke baad booth dobara book hota hai", rebooked.status, 201);
  check("admin kisi ki bhi booking cancel kar sakta hai", (await call("PUT", `/bookings/${rebooked.data._id}/cancel`, { token: admin })).data.status, "cancelled");
  check("admin cancel: booth available", (await call("GET", `/booths/${boothIds.A2}`)).data.status, "available");
  check("history mein cancelled bookings bachi hain", await M.Booking.countDocuments({ boothId: boothIds.A2, status: "cancelled" }), 2);

  // ---------------------------------------------------------------- Event registrations
  section("Event registrations");
  const register1 = (token, eventId) => call("POST", "/registrations", { token, body: { eventId } });
  const reg1 = await register1(att.token, e1._id);
  check("event reg: attendee register", `${reg1.status} ${reg1.data.status}`, "201 registered");
  check("event reg: dobara nahi", (await register1(att.token, e1._id)).status, 409);
  check("event reg: exhibitor nahi", (await register1(exA.token, e1._id)).status, 403);
  check("event reg: event upcoming nahi", (await register1(att.token, e3._id)).status, 409);
  check("event reg: event maujood nahi", (await register1(att.token, ghostId)).status, 404);
  check("event reg: galat id", (await register1(att.token, "abc")).status, 400);
  const myRegs = await call("GET", "/registrations/my", { token: att.token });
  check("event reg: /my mein event ka naam", myRegs.data[0].eventId.name, "Tech Expo");
  check("event reg: /my doosre ki nahi", (await call("GET", "/registrations/my", { token: att2.token })).data.length, 0);
  check("event reg: doosra attendee cancel nahi kar sakta", (await call("PUT", `/registrations/${reg1.data._id}/cancel`, { token: att2.token })).status, 404);
  check("event reg: cancel", (await call("PUT", `/registrations/${reg1.data._id}/cancel`, { token: att.token })).data.status, "cancelled");
  check("event reg: cancel ke baad dobara register", (await register1(att.token, e1._id)).status, 201);
  check("event reg: admin list", (await call("GET", `/registrations?eventId=${e1._id}&status=registered`, { token: admin })).data[0].attendeeId.email, "att1@test.com");
  check("event reg: admin list attendee ko nahi", (await call("GET", "/registrations", { token: att.token })).status, 403);

  // ---------------------------------------------------------------- Sessions
  section("Sessions");
  const sessionBody = (extra = {}) => ({ eventId: e1._id, title: "Opening Talk", startTime: "2030-06-02T10:00:00Z", endTime: "2030-06-02T11:00:00Z", ...extra });
  check("session: attendee nahi bana sakta", (await call("POST", "/sessions", { token: att.token, body: sessionBody() })).status, 403);
  const s1 = (await call("POST", "/sessions", { token: admin, body: sessionBody({ location: "Hall A" }) })).data;
  check("session: bana, default type", s1.type, "session");
  const s2 = (await call("POST", "/sessions", { token: admin, body: sessionBody({ title: "Hands-on", type: "workshop", startTime: "2030-06-03T10:00:00Z", endTime: "2030-06-03T12:00:00Z" }) })).data;
  check("session: workshop", s2.type, "workshop");
  check("session: aakhri din dopahar 3 baje theek", (await call("POST", "/sessions", { token: admin, body: sessionBody({ startTime: "2030-06-05T15:00:00Z", endTime: "2030-06-05T16:00:00Z" }) })).status, 201);
  check("session: end start se pehle", (await call("POST", "/sessions", { token: admin, body: sessionBody({ endTime: "2030-06-02T09:00:00Z" }) })).status, 400);
  check("session: end == start", (await call("POST", "/sessions", { token: admin, body: sessionBody({ endTime: "2030-06-02T10:00:00Z" }) })).status, 400);
  check("session: galat time text", (await call("POST", "/sessions", { token: admin, body: sessionBody({ startTime: "banana" }) })).status, 400);
  check("session: event se pehle", (await call("POST", "/sessions", { token: admin, body: sessionBody({ startTime: "2030-05-30T10:00:00Z", endTime: "2030-05-30T11:00:00Z" }) })).status, 400);
  check("session: event ke baad", (await call("POST", "/sessions", { token: admin, body: sessionBody({ startTime: "2030-06-07T10:00:00Z", endTime: "2030-06-07T11:00:00Z" }) })).status, 400);
  check("session: galat type", (await call("POST", "/sessions", { token: admin, body: sessionBody({ type: "party" }) })).status, 400);
  check("session: event maujood nahi", (await call("POST", "/sessions", { token: admin, body: sessionBody({ eventId: ghostId }) })).status, 404);
  check("session: list time ke hisaab se", (await call("GET", `/sessions?eventId=${e1._id}`)).data.map((s) => s.title).slice(0, 2).join(","), "Opening Talk,Hands-on");
  check("session: type filter", (await call("GET", "/sessions?type=workshop")).data.length, 1);
  check("session: update title", (await call("PUT", `/sessions/${s1._id}`, { token: admin, body: { title: "Keynote" } })).data.title, "Keynote");
  check("session: update event se bahar", (await call("PUT", `/sessions/${s1._id}`, { token: admin, body: { startTime: "2031-01-01T10:00:00Z", endTime: "2031-01-01T11:00:00Z" } })).status, 400);
  check("session: khali update", (await call("PUT", `/sessions/${s1._id}`, { token: admin, body: {} })).status, 400);

  // ---------------------------------------------------------------- Bookmarks
  section("Bookmarks");
  const bm = (method, token, id = s1._id) => call(method, `/sessions/${id}/bookmark`, { token });
  check("bookmark: lagana", (await bm("POST", att.token)).status, 201);
  check("bookmark: dobara nahi", (await bm("POST", att.token)).status, 409);
  check("bookmark: exhibitor nahi", (await bm("POST", exA.token)).status, 403);
  check("bookmark: session maujood nahi", (await bm("POST", att.token, ghostId)).status, 404);
  const bmList = await call("GET", "/sessions/bookmarks/my", { token: att.token });
  check("bookmark: /my mein title aur event", `${bmList.data.length} ${bmList.data[0].sessionId.title} ${bmList.data[0].sessionId.eventId.name}`, "1 Keynote Tech Expo");
  check("bookmark: doosre ka nahi hata sakta", (await bm("DELETE", att2.token)).status, 404);
  check("bookmark: hatana", (await bm("DELETE", att.token)).status, 200);
  check("bookmark: dobara hatana", (await bm("DELETE", att.token)).status, 404);
  await bm("POST", att.token); // session delete wale test ke liye dobara lagate hain

  // ---------------------------------------------------------------- Session registrations
  section("Session registrations");
  const sr = (method, token, id = s1._id) => call(method, `/sessions/${id}/register`, { token });
  check("session reg: event mein register kiye baghair", (await sr("POST", att2.token)).status, 403);
  check("session reg: theek", (await sr("POST", att.token)).status, 201);
  check("session reg: dobara nahi", (await sr("POST", att.token)).status, 409);
  check("session reg: exhibitor nahi", (await sr("POST", exA.token)).status, 403);
  check("session reg: session maujood nahi", (await sr("POST", att.token, ghostId)).status, 404);
  check("session reg: /my", (await call("GET", "/sessions/registrations/my", { token: att.token })).data.length, 1);
  check("session reg: admin list", (await call("GET", `/sessions/${s1._id}/registrations?status=registered`, { token: admin })).data[0].attendeeId.email, "att1@test.com");
  check("session reg: admin list attendee ko nahi", (await call("GET", `/sessions/${s1._id}/registrations`, { token: att.token })).status, 403);
  check("session reg: cancel", (await sr("DELETE", att.token)).data.status, "cancelled");
  check("session reg: dobara cancel", (await sr("DELETE", att.token)).status, 404);
  check("session reg: cancel ke baad dobara register", (await sr("POST", att.token)).status, 201);

  // Purane event ka session: shuru ho chuka, register nahi ho sakta
  await register1(att.token, e4._id);
  const oldSession = (await call("POST", "/sessions", { token: admin, body: { eventId: e4._id, title: "Old Talk", startTime: "2020-01-02T10:00:00Z", endTime: "2020-01-02T11:00:00Z" } })).data;
  check("session reg: shuru ho chuka session", (await sr("POST", att.token, oldSession._id)).status, 409);

  // Event ki registration cancel ho to session registration bhi cancel
  const attEventReg = (await call("GET", "/registrations/my", { token: att.token })).data.find((r) => r.eventId.name === "Tech Expo" && r.status === "registered");
  await call("PUT", `/registrations/${attEventReg._id}/cancel`, { token: att.token });
  check("cascade: event reg cancel -> session reg cancel", await M.SessionRegistration.countDocuments({ attendeeId: att.user.id, status: "registered" }), 0);
  await register1(att.token, e1._id); // aage ke tests ke liye dobara

  // ---------------------------------------------------------------- Messages
  section("Messages");
  const sendMessage = (token, body) => call("POST", "/messages", { token, body });
  const msg = await sendMessage(att.token, { subject: "Parking", message: "Parking hai?", eventId: e1._id, senderId: exA.user.id, status: "replied", reply: "hack" });
  check("message: bheja, status open", `${msg.status} ${msg.data.status}`, "201 open");
  check("message: senderId token se, reply nahi mana", `${msg.data.senderId === att.user.id} ${msg.data.reply}`, "true undefined");
  check("message: eventId ke baghair bhi theek", (await sendMessage(exA.token, { subject: "Help", message: "Madad" })).status, 201);
  check("message: subject khali", (await sendMessage(att.token, { subject: "", message: "x" })).status, 400);
  check("message: galat eventId", (await sendMessage(att.token, { subject: "s", message: "m", eventId: "abc" })).status, 400);
  check("message: event maujood nahi", (await sendMessage(att.token, { subject: "s", message: "m", eventId: ghostId })).status, 404);
  check("message: admin nahi bhej sakta", (await sendMessage(admin, { subject: "s", message: "m" })).status, 403);
  check("message: /my", (await call("GET", "/messages/my", { token: att.token })).data.length, 1);
  check("message: admin list (open)", (await call("GET", "/messages?status=open", { token: admin })).data.length, 2);
  check("message: admin list attendee ko nahi", (await call("GET", "/messages", { token: att.token })).status, 403);
  check("message: attendee jawab nahi de sakta", (await call("PUT", `/messages/${msg.data._id}/reply`, { token: att.token, body: { reply: "x" } })).status, 403);
  check("message: khali jawab", (await call("PUT", `/messages/${msg.data._id}/reply`, { token: admin, body: { reply: "  " } })).status, 400);
  const replied = await call("PUT", `/messages/${msg.data._id}/reply`, { token: admin, body: { reply: "Ji haan, parking free hai." } });
  check("message: jawab diya", `${replied.status} ${replied.data.status}`, "200 replied");
  check("message: dobara jawab nahi", (await call("PUT", `/messages/${msg.data._id}/reply`, { token: admin, body: { reply: "again" } })).status, 409);
  check("message: jawab maujood nahi", (await call("PUT", `/messages/${ghostId}/reply`, { token: admin, body: { reply: "x" } })).status, 404);
  check("message: user ko jawab nazar aata hai", (await call("GET", "/messages/my", { token: att.token })).data[0].reply, "Ji haan, parking free hai.");

  // ---------------------------------------------------------------- Feedback
  section("Feedback");
  const fb = await call("POST", "/feedback", { token: att.token, body: { subject: "Great", description: "Bohat acha", status: "reviewed", userId: exA.user.id } });
  check("feedback: bheja, status new", `${fb.status} ${fb.data.status}`, "201 new");
  check("feedback: userId token se", fb.data.userId === att.user.id, true);
  check("feedback: subject khali", (await call("POST", "/feedback", { token: att.token, body: { subject: "", description: "x" } })).status, 400);
  check("feedback: admin nahi bhej sakta", (await call("POST", "/feedback", { token: admin, body: { subject: "s", description: "d" } })).status, 403);
  check("feedback: admin list", (await call("GET", "/feedback?status=new", { token: admin })).data[0].userId.email, "att1@test.com");
  check("feedback: attendee list nahi dekh sakta", (await call("GET", "/feedback", { token: att.token })).status, 403);
  check("feedback: galat status filter", (await call("GET", "/feedback?status=zzz", { token: admin })).status, 400);
  check("feedback: reviewed", (await call("PUT", `/feedback/${fb.data._id}/review`, { token: admin })).data.status, "reviewed");
  check("feedback: new list ab khali", (await call("GET", "/feedback?status=new", { token: admin })).data.length, 0);
  check("feedback: galat id", (await call("PUT", "/feedback/abc/review", { token: admin })).status, 400);
  check("feedback: maujood nahi", (await call("PUT", `/feedback/${ghostId}/review`, { token: admin })).status, 404);

  // ---------------------------------------------------------------- Users aur Stats
  section("Users aur Stats");
  const users = await call("GET", "/users", { token: admin });
  check("users: admin list", users.status, 200);
  check("users: passwordHash nahi", users.data.some((u) => "passwordHash" in u), false);
  check("users: tadaad", users.data.length, await M.User.countDocuments());
  check("users: role filter", (await call("GET", "/users?role=exhibitor", { token: admin })).data.every((u) => u.role === "exhibitor"), true);
  check("users: galat role filter", (await call("GET", "/users?role=boss", { token: admin })).status, 400);
  check("users: attendee nahi dekh sakta", (await call("GET", "/users", { token: att.token })).status, 403);
  check("users: bina token", (await call("GET", "/users")).status, 401);

  const stats = await call("GET", "/admin/stats", { token: admin });
  check("stats: status", stats.status, 200);
  const s = stats.data;
  check("stats: users.total", s.users.total, await M.User.countDocuments());
  check("stats: users.admin", s.users.admin, 1);
  check("stats: events.total", s.events.total, await M.Event.countDocuments());
  check("stats: events.completed", s.events.completed, 1);
  check("stats: exhibitors.pending", s.exhibitors.pending, await M.Exhibitor.countDocuments({ approvalStatus: "pending" }));
  check("stats: exhibitors.approved", s.exhibitors.approved, 3);
  check("stats: booths.total", s.booths.total, await M.Booth.countDocuments());
  check("stats: booths.unavailable", s.booths.unavailable, 1);
  check("stats: bookings.cancelled", s.bookings.cancelled, 2);
  check("stats: bookings.confirmed", s.bookings.confirmed, await M.Booking.countDocuments({ status: "confirmed" }));
  check("stats: eventRegistrations.registered", s.eventRegistrations.registered, await M.EventRegistration.countDocuments({ status: "registered" }));
  check("stats: sessions.total", s.sessions.total, await M.Session.countDocuments());
  check("stats: sessionRegistrations.cancelled", s.sessionRegistrations.cancelled, await M.SessionRegistration.countDocuments({ status: "cancelled" }));
  check("stats: messages.open", s.messages.open, 1);
  check("stats: messages.replied", s.messages.replied, 1);
  check("stats: feedback.reviewed", s.feedback.reviewed, 1);
  check("stats: attendee nahi dekh sakta", (await call("GET", "/admin/stats", { token: att.token })).status, 403);

  // ---------------------------------------------------------------- Delete ke qaide
  section("Delete ke qaide");
  check("session delete: admin", (await call("DELETE", `/sessions/${s1._id}`, { token: admin })).status, 200);
  check("session delete: bookmarks bhi gaye", await M.SessionBookmark.countDocuments({ sessionId: s1._id }), 0);
  check("session delete: registrations bhi gayi", await M.SessionRegistration.countDocuments({ sessionId: s1._id }), 0);
  check("session delete: dobara", (await call("DELETE", `/sessions/${s1._id}`, { token: admin })).status, 404);
  check("booth delete: unbooked booth", (await call("DELETE", `/booths/${boothIds.A10}`, { token: admin })).status, 200);
  check("booth delete: dobara", (await call("DELETE", `/booths/${boothIds.A10}`, { token: admin })).status, 404);
  check("event delete: booths wala event", (await call("DELETE", `/events/${e1._id}`, { token: admin })).status, 409);
  check("event delete: sessions wala event", (await call("DELETE", `/events/${e4._id}`, { token: admin })).status, 409);
  const e5 = (await call("POST", "/events", { token: admin, body: { ...eventBody, name: "Registrations Only" } })).data;
  await register1(att2.token, e5._id);
  check("event delete: registrations wala event", (await call("DELETE", `/events/${e5._id}`, { token: admin })).status, 409);
  const e6 = (await call("POST", "/events", { token: admin, body: { ...eventBody, name: "Empty" } })).data;
  check("event delete: khali event", (await call("DELETE", `/events/${e6._id}`, { token: admin })).status, 200);
  check("event delete: attendee nahi", (await call("DELETE", `/events/${e2._id}`, { token: att.token })).status, 403);

  // ---------------------------------------------------------------- Aam
  section("Aam");
  check("health", (await fetch(`${origin}/api/health`)).status, 200);
  check("route maujood nahi", (await call("GET", "/nahi-hai")).status, 404);
} catch (error) {
  failed++;
  console.error("\nTEST SCRIPT ROOK GAYA:", error);
} finally {
  // Safai: test ki logo files, test database, server
  for (const logoPath of logosToCleanUp) await deleteLogo(logoPath);
  if (mongoose.connection.name === TEST_DB) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
}

console.log(`\n${passed}/${passed + failed} checks pass hue${failed ? `, ${failed} fail` : ""}.`);
process.exit(failed ? 1 : 0);