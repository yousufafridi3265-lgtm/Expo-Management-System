import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import FilterChips from "../../components/common/FilterChips";
import CancelBookingButton from "../../components/common/CancelBookingButton";
import useFetch from "../../hooks/useFetch";
import { getAllBookings } from "../../apis/bookingApi";
import { formatDateRange } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import { eventPath } from "../../routePaths";

const FILTERS = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" }
];

const AdminBookingsPage = () => {
  const [status, setStatus] = useState("");
  const { data: bookings, loading, error, reload } = useFetch(
    () => getAllBookings(status ? { status } : undefined),
    [status]
  );

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading bookings..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    // Event, booth ya company delete ho chuki ho to populate null deta hai
    const items = bookings.filter((booking) => booking.eventId && booking.boothId);

    if (items.length === 0) {
      return (
        <EmptyState
          title="No bookings found"
          message={status ? `There are no ${status} bookings.` : "No exhibitor has booked a booth yet."}
        />
      );
    }

    return (
      <div className="admin-list">
        {items.map((booking) => {
          const { eventId: event, boothId: booth, exhibitorId: company } = booking;
          return (
            <article key={booking._id} className="card admin-row">
              <div>
                <div className="admin-row-title-line">
                  <h2 className="admin-row-title">
                    Booth {booth.boothNumber} · {company ? company.companyName : "Company not found"}
                  </h2>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="feature-text">
                  <Link to={eventPath(event._id)} className="link">
                    {event.name}
                  </Link>{" "}
                  · Size: {booth.size} · Price: {formatPrice(booth.price)}
                </p>
                <p className="event-meta">
                  <FiCalendar aria-hidden="true" />
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                {company?.phone && <p className="feature-text">Phone: {company.phone}</p>}
              </div>
              {booking.status === "confirmed" && (
                <div className="admin-row-actions">
                  <CancelBookingButton bookingId={booking._id} boothNumber={booth.boothNumber} onCancelled={reload} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="Bookings" subtitle="All booth bookings made by exhibitors" />
        <FilterChips options={FILTERS} value={status} onChange={setStatus} label="Filter bookings by status" />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default AdminBookingsPage;
