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
import CancelRegistrationButton from "../../components/common/CancelRegistrationButton";
import ListToolbar from "../../components/lists/ListToolbar";
import ExportButtons from "../../components/lists/ExportButtons";
import useFetch from "../../hooks/useFetch";
import useListView from "../../hooks/useListView";
import { getMyRegistrations } from "../../apis/registrationApi";
import { exportToExcel, exportToPdf } from "../../utils/exportFile";
import { formatDateRange, formatDateTime } from "../../utils/formatDate";
import { ROUTES, eventPath } from "../../routePaths";

const STATUS_OPTIONS = [
  { value: "registered", label: "Registered" },
  { value: "cancelled", label: "Cancelled" }
];

// Export file ke columns
const EXPORT_COLUMNS = [
  { header: "Event", key: "event", width: 32 },
  { header: "Event dates", key: "dates", width: 26 },
  { header: "Location", key: "location", width: 28 },
  { header: "Status", key: "status", width: 14 },
  { header: "Registered on", key: "registeredOn", width: 20 }
];

// useListView ke helpers module level par, taake har render par naye na bane
const getSearchText = (registration) => `${registration.eventId.name} ${registration.eventId.location}`;
const getStatus = (registration) => registration.status;

const toExportRow = (registration) => ({
  event: registration.eventId.name,
  dates: formatDateRange(registration.eventId.startDate, registration.eventId.endDate),
  location: registration.eventId.location,
  status: registration.status,
  registeredOn: registration.createdAt ? formatDateTime(registration.createdAt) : ""
});

const MyRegistrationsPage = () => {
  const { data: registrations, loading, error, reload } = useFetch(getMyRegistrations);

  // Agar koi event baad mein delete ho gaya to populate null deta hai, us registration ko chhor dete hain
  const items = useMemo(() => (registrations || []).filter((registration) => registration.eventId), [registrations]);

  const view = useListView({ items, getSearchText, getStatus });

  // Export mein sirf maujooda page nahi, filter ke baad ki poori list jati hai
  const exportOptions = () => ({ columns: EXPORT_COLUMNS, rows: view.filtered.map(toExportRow) });
  const handleExcel = () => exportToExcel({ ...exportOptions(), fileName: "my-registrations", sheetName: "Registrations" });
  const handlePdf = () => exportToPdf({ ...exportOptions(), fileName: "my-registrations", title: "My event registrations" });

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading your registrations..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

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
      <>
        <ListToolbar
          search={view.search}
          onSearchChange={view.changeSearch}
          searchPlaceholder="Event name or location"
          status={view.status}
          onStatusChange={view.changeStatus}
          statusOptions={STATUS_OPTIONS}
        />

        <div className="list-summary">
          <p className="list-summary-text" aria-live="polite">
            {view.filtered.length} of {items.length} registration{items.length === 1 ? "" : "s"}
          </p>
          <ExportButtons onExcel={handleExcel} onPdf={handlePdf} disabled={view.filtered.length === 0} />
        </div>

        {view.filtered.length === 0 ? (
          <EmptyState title="No matching registrations" message="Try different words or clear the filters.">
            <Button variant="secondary" onClick={view.clearFilters}>
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <>
            <ul className="registration-list">
              {view.pageItems.map((registration) => {
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
            <Pagination page={view.page} pageCount={view.pageCount} onChange={view.setPage} />
          </>
        )}
      </>
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

