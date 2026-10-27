import { FiBriefcase } from "react-icons/fi";
import { getFileUrl } from "../../utils/fileUrl";

// Company ka logo. Logo upload na kiya ho to ek saada icon dikhta hai
// size: "md" (card mein) ya "lg" (detail page par)
const ExhibitorLogo = ({ logo, companyName, size = "md" }) => {
  if (!logo) {
    return (
      <span className={`exhibitor-logo exhibitor-logo-${size} exhibitor-logo-empty`} aria-hidden="true">
        <FiBriefcase />
      </span>
    );
  }

  return (
    <img src={getFileUrl(logo)} alt={`${companyName} logo`}  className={`exhibitor-logo exhibitor-logo-${size}`} />
  );
};

export default ExhibitorLogo;

