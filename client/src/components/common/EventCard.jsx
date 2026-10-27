import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import { formatDateRange } from "../../utils/formatDate";
import { eventPath } from "../../routePaths";

// Events ki list mein ek event ka card. Poora card click hone par detail page khulta hai
const EventCard = ({ event }) => {
  return (
    <Link to={eventPath(event._id)} className="card event-card">
      <div className="event-card-top">
        <h3 className="event-card-title">{event.name}</h3>
        <StatusBadge status={event.status} />
      </div>

      <p className="event-meta">
        <FiCalendar aria-hidden="true" />
        {formatDateRange(event.startDate, event.endDate)}
      </p>
      <p className="event-meta">
        <FiMapPin aria-hidden="true" />
        {event.location}
      </p>

      {event.description && <p className="event-card-text">{event.description}</p>}
    </Link>
  );
};

export default EventCard;