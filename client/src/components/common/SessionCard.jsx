import { FiClock, FiMapPin } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import { formatTimeRange } from "../../utils/formatDate";

// Ek session ya workshop ka card. children mein action buttons aate hain (bookmark, register waghaira)
const SessionCard = ({ session, eventName, children }) => {
  return (
    <li className="session-item">
      <div className="session-item-top">
        <h3 className="session-item-title">{session.title}</h3>
        <StatusBadge status={session.type} />
      </div>
      {eventName && <p className="feature-text">{eventName}</p>}
      <p className="event-meta">
        <FiClock aria-hidden="true" />
        {formatTimeRange(session.startTime, session.endTime)}
      </p>
      {session.location && (
        <p className="event-meta">
          <FiMapPin aria-hidden="true" />
          {session.location}
        </p>
      )}
      {session.description && <p className="feature-text">{session.description}</p>}
      {children && <div className="session-item-actions">{children}</div>}
    </li>
  );
};

export default SessionCard;