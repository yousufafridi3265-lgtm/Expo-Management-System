import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import EventCard from "../../components/common/EventCard";
import useFetch from "../../hooks/useFetch";
import { getEvents } from "../../apis/eventApi";

// value: backend ka ?status= (khali matlab sab events)
const FILTERS = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const EventsPage = () => {
  const [status, setStatus] = useState("");

  const { data: events, loading, error, reload } = useFetch(
    () => getEvents(status ? { status } : undefined),
    [status]
  );

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading events..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (events.length === 0) {
      return (
        <EmptyState
          title="No events found"
          message={status ? "There are no events with this status." : "No events have been added yet."}
        />
      );
    }

    return (
      <div className="event-grid">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container-wide">
        <PageHeader title="Events" subtitle="Browse expos and see what is coming up" />

        <div className="filter-chips" role="group" aria-label="Filter events by status">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`chip ${status === filter.value ? "chip-active" : ""}`}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default EventsPage;