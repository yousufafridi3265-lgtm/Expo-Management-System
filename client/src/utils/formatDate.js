// Backend dates ko UTC mein rakhta hai. Admin sirf tareekh (jaise 2026-11-01) bheje to woh UTC ki aadhi raat hoti hai.
// Isliye UTC mein dikhate hain, warna kuch mulkon mein tareekh ek din pehle nazar aati hai
const dayFormat = { day: "numeric", month: "short", year: "numeric" };
const timeFormat = { hour: "2-digit", minute: "2-digit", hour12: false };


export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });

// "1 Nov 2026" (ek din ka event) ya "1 Nov 2026 - 3 Nov 2026"
export const formatDateRange = (start, end) => {
  const from = formatDate(start);
  const to = formatDate(end);
  return from === to ? from : `${from} - ${to}`;
};

// Session ke waqt asli lamhe (instant) hain, isliye yahan browser ka local waqt dikhate hain (date wali tarah UTC nahi)
// "1 Nov 2026, 10:00 - 11:30"  ya agar doosre din khatam ho  "1 Nov 2026, 22:00 - 2 Nov 2026, 01:00"
export const formatTimeRange = (start, end) => {
  const from = new Date(start);
  const to = new Date(end);
  const sameDay = from.toLocaleDateString("en-GB", dayFormat) === to.toLocaleDateString("en-GB", dayFormat);
  const fromText = `${from.toLocaleDateString("en-GB", dayFormat)}, ${from.toLocaleTimeString("en-GB", timeFormat)}`;
  const toText = sameDay
    ? to.toLocaleTimeString("en-GB", timeFormat)
    : `${to.toLocaleDateString("en-GB", dayFormat)}, ${to.toLocaleTimeString("en-GB", timeFormat)}`;
  return `${fromText} - ${toText}`;
};

// Bheje jane ka waqt, aap ke apne time zone mein. "29 Oct 2026, 18:05"
export const formatDateTime = (value) => `${new Date(value).toLocaleDateString("en-GB", dayFormat)}, ${new Date(value).toLocaleTimeString("en-GB", timeFormat)}`;

