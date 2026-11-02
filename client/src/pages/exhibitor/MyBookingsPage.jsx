import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import CancelBookingButton from "../../components/common/CancelBookingButton";
import ListToolbar from "../../components/lists/ListToolbar";
import ExportButtons from "../../components/lists/ExportButtons";
import useFetch from "../../hooks/useFetch";
import useListView from "../../hooks/useListView";
import { getMyBookings } from "../../apis/bookingApi";
import { exportToExcel, exportToPdf } from "../../utils/exportFile";
import { formatDateRange, formatDateTime } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import { ROUTES, eventPath } from "../../routePaths";

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

// Export file ke columns
const EXPORT_COLUMNS = [
  { header: "Event", key: "event", width: 32 },
  { header: "Event dates", key: "dates", width: 26 },
  { header: "Booth", key: "booth", width: 12 },
  { header: "Size", key: "size", width: 14 },
  { header: "Price", key: "price", width: 14 },
  { header: "Location", key: "location", width: 26 },
  { header: "Status", key: "status", width: 14 },
  { header: "Booked on", key: "bookedOn", width: 20 },
];

// useListView ke helpers module level par, taake har render par naye na bane
const getSearchText = (booking) =>
  `${booking.eventId.name} ${booking.boothId.boothNumber} ${booking.boothId.location || ""}`;
const getStatus = (booking) => booking.status;

const toExportRow = (booking) => ({
  event: booking.eventId.name,
  dates: formatDateRange(booking.eventId.startDate, booking.eventId.endDate),
  booth: booking.boothId.boothNumber,
  size: booking.boothId.size,
  price: formatPrice(booking.boothId.price),
  location: booking.boothId.location || "",
  status: booking.status,
  bookedOn: booking.createdAt ? formatDateTime(booking.createdAt) : "",
});

const MyBookingsPage = () => {
  const { data: bookings, loading, error, reload } = useFetch(getMyBookings);

  // Agar event ya booth baad mein delete ho jaye to populate null deta hai, aisi booking chhor dete hain
  const items = useMemo(
    () =>
      (bookings || []).filter((booking) => booking.eventId && booking.boothId),
    [bookings],
  );

  const view = useListView({ items, getSearchText, getStatus });

  // Export mein sirf maujooda page nahi, filter ke baad ki poori list jati hai
  const exportOptions = () => ({
    columns: EXPORT_COLUMNS,
    rows: view.filtered.map(toExportRow),
  });
  const handleExcel = () =>
    exportToExcel({
      ...exportOptions(),
      fileName: "my-bookings",
      sheetName: "Bookings",
    });
  const handlePdf = () =>
    exportToPdf({
      ...exportOptions(),
      fileName: "my-bookings",
      title: "My booth bookings",
    });

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading your bookings..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (items.length === 0) {
      return (
        <EmptyState
          title="No bookings yet"
          message="Pick an event, choose a booth and it will show up here."
        >
          <Link to={ROUTES.events} className="btn btn-primary">
            Browse events
          </Link>
        </EmptyState>
      );
    }

    return (
      <>
        <ListToolbar
          search={view.search}
          onSearchChange={view.changeSearch}
          searchPlaceholder="Event name, booth number or location"
          status={view.status}
          onStatusChange={view.changeStatus}
          statusOptions={STATUS_OPTIONS}
        />

        <div className="list-summary">
          <p className="list-summary-text" aria-live="polite">
            {view.filtered.length} of {items.length} booking
            {items.length === 1 ? "" : "s"}
          </p>
          <ExportButtons
            onExcel={handleExcel}
            onPdf={handlePdf}
            disabled={view.filtered.length === 0}
          />
        </div>

        {view.filtered.length === 0 ? (
          <EmptyState
            title="No matching bookings"
            message="Try different words or clear the filters."
          >
            <Button variant="secondary" onClick={view.clearFilters}>
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <>
            <ul className="registration-list">
              {view.pageItems.map((booking) => {
                const { eventId: event, boothId: booth } = booking;
                return (
                  <li key={booking._id} className="card registration-item">
                    <div className="registration-item-top">
                      <Link
                        to={eventPath(event._id)}
                        className="registration-item-title"
                      >
                        {event.name}
                      </Link>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="feature-text">
                      Booth {booth.boothNumber} · Size: {booth.size} · Price:{" "}
                      {formatPrice(booth.price)}
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
                        <CancelBookingButton
                          bookingId={booking._id}
                          boothNumber={booth.boothNumber}
                          onCancelled={reload}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={view.page}
              pageCount={view.pageCount}
              onChange={view.setPage}
              pageSize={view.pageSize}
              onPageSizeChange={view.changePageSize}
              totalItems={view.filtered.length}
            />
          </>
        )}
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader
          title="My bookings"
          subtitle="Booths your company has booked"
        />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default MyBookingsPage;
