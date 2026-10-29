import { Link } from "react-router-dom";
import { FiCheck, FiX } from "react-icons/fi";
import ExhibitorLogo from "../common/ExhibitorLogo";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { exhibitorPath } from "../../routePaths";

// Admin ki list mein ek company. Sirf wohi button dikhta hai jo abhi ke status se alag ho
// onChangeStatus(exhibitor, "approved" | "rejected")
const AdminExhibitorCard = ({ exhibitor, busy, onChangeStatus }) => {
  const owner = exhibitor.userId;

  return (
    <article className="card admin-row">
      <div className="admin-row-main">
        <ExhibitorLogo logo={exhibitor.logo} companyName={exhibitor.companyName} />
        <div>
          <div className="admin-row-title-line">
            <h2 className="admin-row-title">{exhibitor.companyName}</h2>
            <StatusBadge status={exhibitor.approvalStatus} />
          </div>
          <p className="feature-text">
            {exhibitor.category} · {exhibitor.phone}
          </p>
          {/* Agar user delete ho chuka ho to userId khali aata hai */}
          <p className="feature-text">{owner ? `${owner.name} (${owner.email})` : "Owner account not found"}</p>
          {exhibitor.approvalStatus === "approved" && (
            <Link to={exhibitorPath(exhibitor._id)} className="link">
              View public page
            </Link>
          )}
        </div>
      </div>

      <div className="admin-row-actions">
        {exhibitor.approvalStatus !== "approved" && (
          <Button loading={busy} onClick={() => onChangeStatus(exhibitor, "approved")}>
            <FiCheck aria-hidden="true" />
            Approve
          </Button>
        )}
        {exhibitor.approvalStatus !== "rejected" && (
          <Button variant="secondary" loading={busy} onClick={() => onChangeStatus(exhibitor, "rejected")}>
            <FiX aria-hidden="true" />
            Reject
          </Button>
        )}
      </div>
    </article>
  );
};

export default AdminExhibitorCard;