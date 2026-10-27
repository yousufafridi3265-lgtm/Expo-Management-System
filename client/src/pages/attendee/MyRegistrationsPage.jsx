import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import CancelRegistrationButton from "../../components/common/CancelRegistrationButton";
import useFetch from "../../hooks/useFetch";
import { getMyRegistrations } from "../../apis/registrationApi";
import { formatDateRange } from "../../utils/formatDate";
import { ROUTES, eventPath } from "../../routePaths";

const MyRegistrationsPage = () => {
  const { data: registrations, loading, error, reload } = useFetch(getMyRegistrations);

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading your registrations..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    // Agar koi event baad mein delete ho gaya to populate null deta hai, us registration ko chhor dete hain
    const items = registrations.filter((registration) => registration.eventId);

    if (items.length === 0) {
      return (
        <EmptyState title="No registrations yet" message="Register for an event and it will show up here.">
          <Link to={ROUTES.events} className="btn btn-primary">
            Browse events
          </Link>
        </EmptyState>
      );
    }

    return (
      <ul className="registration-list">
        {items.map((registration) => {
          const event = registration.eventId;
          return (
            <li key={registration._id} className="card registration-item">
              <div className="registration-item-top">
                <Link to={eventPath(event._id)} className="registration-item-title">
                  {event.name}
                </Link>
                <StatusBadge status={registration.status} />
              </div>
              <p className="event-meta">
                <FiCalendar aria-hidden="true" />
                {formatDateRange(event.startDate, event.endDate)}
              </p>
              <p className="event-meta">
                <FiMapPin aria-hidden="true" />
                {event.location}
              </p>
              {registration.status === "registered" && (
                <div className="registration-item-actions">
                  <CancelRegistrationButton registrationId={registration._id} onCancelled={reload} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="My registrations" subtitle="Events you have registered for" />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default MyRegistrationsPage;