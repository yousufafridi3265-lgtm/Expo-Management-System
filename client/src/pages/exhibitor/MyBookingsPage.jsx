import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import CancelBookingButton from "../../components/common/CancelBookingButton";
import useFetch from "../../hooks/useFetch";
import { getMyBookings } from "../../apis/bookingApi";
import { formatDateRange } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import { ROUTES, eventPath } from "../../routePaths";

const MyBookingsPage = () => {
  const { data: bookings, loading, error, reload } = useFetch(getMyBookings);

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading your bookings..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    // Agar event ya booth baad mein delete ho jaye to populate null deta hai, aisi booking chhor dete hain
    const items = bookings.filter((booking) => booking.eventId && booking.boothId);

    if (items.length === 0) {
      return (
        <EmptyState title="No bookings yet" message="Pick an event, choose a booth and it will show up here.">
          <Link to={ROUTES.events} className="btn btn-primary">
            Browse events
          </Link>
        </EmptyState>
      );
    }

    return (
      <ul className="registration-list">
        {items.map((booking) => {
          const { eventId: event, boothId: booth } = booking;
          return (
            <li key={booking._id} className="card registration-item">
              <div className="registration-item-top">
                <Link to={eventPath(event._id)} className="registration-item-title">
                  {event.name}
                </Link>
                <StatusBadge status={booking.status} />
              </div>
              <p className="feature-text">
                Booth {booth.boothNumber} · Size: {booth.size} · Price: {formatPrice(booth.price)}
              </p>
              {booth.location && (
                <p className="event-meta">
                  <FiMapPin aria-hidden="true" />
                  {booth.location}
                </p>
              )}
              <p className="event-meta">
                <FiCalendar aria-hidden="true" />
                {formatDateRange(event.startDate, event.endDate)}
              </p>
              {booking.status === "confirmed" && (
                <div className="registration-item-actions">
                  <CancelBookingButton bookingId={booking._id} boothNumber={booth.boothNumber} onCancelled={reload} />
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
        <PageHeader title="My bookings" subtitle="Booths your company has booked" />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default MyBookingsPage;

