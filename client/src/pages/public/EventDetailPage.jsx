import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiMapPin } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import StatusBadge from "../../components/common/StatusBadge";
import useFetch from "../../hooks/useFetch";
import { getEventById } from "../../apis/eventApi";
import { formatDateRange } from "../../utils/formatDate";
import { ROUTES } from "../../routePaths";
import EventRegistrationPanel from "../../components/common/EventRegistrationPanel";
import EventBooths from "../../components/common/EventBooths";

const EventDetailPage = () => {
  const { id } = useParams();
  const {
    data: event,
    loading,
    error,
    reload,
  } = useFetch(() => getEventById(id), [id]);

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading event..." />;
    // Galat id (400) ya event nahi mila (404): backend ka message hi dikha dete hain
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    return (
      <article className="card event-detail">
        <div className="event-detail-top">
          <h1 className="event-detail-title">{event.name}</h1>
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

        <h2 className="event-detail-heading">About this event</h2>
        <p className="event-detail-text">
          {event.description || "No description has been added yet."}
        </p>
        <h2 className="event-detail-heading">Booths</h2>
        <EventBooths event={event} />
        <EventRegistrationPanel event={event} />
      </article>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <Link to={ROUTES.events} className="back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to events
        </Link>
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default EventDetailPage;
