import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { exhibitorPath } from "../../routePaths";

// Backend ke teen approvalStatus ke hisaab se exhibitor ko saaf batata hai ke uski company ke saath kya ho raha hai
const MESSAGES = {
  pending: "Organizers are reviewing your company. It is not visible to visitors yet.",
  approved: "Your company is live and visitors can find it in the exhibitors list.",
  rejected: "Your company was not approved, so it is not shown publicly. Please contact the organizers."
};

const ApprovalNotice = ({ profile }) => {
  return (
    <div className="approval-notice">
      <div className="approval-notice-top">
        <span className="approval-notice-label">Approval status</span>
        <StatusBadge status={profile.approvalStatus} />
      </div>
      <p className="registration-note">{MESSAGES[profile.approvalStatus]}</p>
      {profile.approvalStatus === "approved" && (
        <Link to={exhibitorPath(profile._id)} className="link">
          View public page
        </Link>
      )}
    </div>
  );
};

export default ApprovalNotice;