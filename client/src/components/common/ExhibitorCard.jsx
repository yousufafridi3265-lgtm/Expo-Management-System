import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import ExhibitorLogo from "./ExhibitorLogo";
import { exhibitorPath } from "../../routePaths";

// Exhibitors ki list mein ek company ka card. Poora card click hone par detail page khulta hai
const ExhibitorCard = ({ exhibitor }) => {
  return (
    <Link to={exhibitorPath(exhibitor._id)} className="card exhibitor-card">
      <div className="exhibitor-card-top">
        <ExhibitorLogo logo={exhibitor.logo} companyName={exhibitor.companyName} />
        <div>
          <h3 className="exhibitor-card-title">{exhibitor.companyName}</h3>
          <span className="badge badge-info">{exhibitor.category}</span>
        </div>
      </div>

      <p className="event-meta">
        <FiMapPin aria-hidden="true" />
        {exhibitor.address}
      </p>

      {exhibitor.description && <p className="event-card-text">{exhibitor.description}</p>}
    </Link>
  );
};

export default ExhibitorCard;