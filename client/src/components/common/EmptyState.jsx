import { FiInbox } from "react-icons/fi";

// Jab list khali ho: "Koi event nahi mila" waghaira. children mein koi button bhi de sakte hain
// headingTag: aam taur par "h3"; poore page ki khali halat (jaise 404) mein "h1" dein
const EmptyState = ({ title, message, children, headingTag: Heading = "h3" }) => {
  return (
    <div className="card empty-state">
      <FiInbox className="empty-state-icon" aria-hidden="true" />
      <Heading className="empty-state-title">{title}</Heading>
      {message && <p className="empty-state-message">{message}</p>}
      {children && <div className="empty-state-action">{children}</div>}
    </div>
  );
};

export default EmptyState;