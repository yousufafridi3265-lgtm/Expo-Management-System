// Backend ke har status ka rang ek jagah tay hai. Naya status aaye to sirf yahan likhein
const STATUS_TONES = {
  approved: "success",
  available: "success",
  confirmed: "success",
  registered: "success",
  replied: "success",
  reviewed: "success",
  ongoing: "success",
  pending: "warning",
  open: "warning",
  new: "warning",
  rejected: "danger",
  cancelled: "danger",
  upcoming: "info",
  booked: "info",
  unavailable: "neutral",
  completed: "neutral",
  session: "info",
  workshop: "warning",
};

const StatusBadge = ({ status }) => {
  const tone = STATUS_TONES[status] || "neutral";
  return <span className={`badge badge-${tone}`}>{status}</span>;
};

export default StatusBadge;
