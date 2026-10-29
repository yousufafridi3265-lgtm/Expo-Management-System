import { Link } from "react-router-dom";

// Ek ginti ka dabba: bara number, naam, aur neeche chhoti tafseel. "to" ho to poora dabba link ban jata hai
const StatCard = ({ icon: Icon, label, value, detail, to, highlight = false }) => {
  const content = (
    <>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && <Icon className="stat-card-icon" aria-hidden="true" />}
      </div>
      <p className="stat-card-value">{value}</p>
      {detail && <p className="stat-card-detail">{detail}</p>}
    </>
  );

  const className = `card stat-card ${highlight ? "stat-card-highlight" : ""} ${to ? "stat-card-link" : ""}`;

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default StatCard;