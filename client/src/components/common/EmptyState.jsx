import { FiInbox } from "react-icons/fi";

// Jab list khali ho: "Koi event nahi mila" waghaira. children mein koi button bhi de sakte hain
const EmptyState = ({ title, message, children }) => {
  return (
    <div className="card empty-state">
      <FiInbox className="empty-state-icon" aria-hidden="true" />
      <h3 className="empty-state-title" title={title}>{title}</h3>
      {message && <p className="empty-state-message" title={message}>{message}</p>}
      {children && <div className="empty-state-action"  title={children}>{children}</div>}
    </div>
  );
};

export default EmptyState;