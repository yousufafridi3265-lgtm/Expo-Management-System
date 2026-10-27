// Backend dates ko UTC mein rakhta hai. Admin sirf tareekh (jaise 2026-11-01) bheje to woh UTC ki aadhi raat hoti hai.
// Isliye UTC mein dikhate hain, warna kuch mulkon mein tareekh ek din pehle nazar aati hai
const formatDate = (value) =>
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

export default formatDate;