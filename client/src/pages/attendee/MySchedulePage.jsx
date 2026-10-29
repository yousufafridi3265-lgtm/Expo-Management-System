import { useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import FilterChips from "../../components/common/FilterChips";
import SessionCard from "../../components/common/SessionCard";
import SessionActions from "../../components/common/SessionActions";
import useFetch from "../../hooks/useFetch";
import { getMyBookmarks, getMySessionRegistrations } from "../../apis/sessionApi";
import { ROUTES, eventPath } from "../../routePaths";

const TABS = [
  { value: "registered", label: "Registered" },
  { value: "bookmarked", label: "Bookmarked" }
];

const MySchedulePage = () => {
  const [tab, setTab] = useState("registered");
  const registrationsRequest = useFetch(getMySessionRegistrations);
  const bookmarksRequest = useFetch(getMyBookmarks);

  const refresh = () => {
    registrationsRequest.reload();
    bookmarksRequest.reload();
  };

  const renderContent = () => {
    // Loader sirf pehli dafa. Button dabane ke baad list chupke se naya data le leti hai
    const firstLoad = !registrationsRequest.data || !bookmarksRequest.data;
    if (firstLoad && !(registrationsRequest.error || bookmarksRequest.error)) return <PageLoader text="Loading your schedule..." />;
    const error = registrationsRequest.error || bookmarksRequest.error;
    if (error) return <ErrorMessage message={error} onRetry={refresh} />;

    // Session baad mein delete ho jaye to populate null deta hai, use chhor dete hain
    const registrations = registrationsRequest.data.filter((item) => item.status === "registered" && item.sessionId);
    const bookmarks = bookmarksRequest.data.filter((item) => item.sessionId);
    const registeredIds = new Set(registrations.map((item) => item.sessionId._id));
    const bookmarkedIds = new Set(bookmarks.map((item) => item.sessionId._id));

    const items = (tab === "registered" ? registrations : bookmarks).map((item) => item.sessionId);
    // Waqt ke hisaab se, jo pehle hai woh upar
    items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    if (items.length === 0) {
      return (
        <EmptyState
          title={tab === "registered" ? "No registered sessions" : "No bookmarked sessions"}
          message="Open an event, find a session and it will show up here."
        >
          <Link to={ROUTES.events} className="btn btn-primary">
            Browse events
          </Link>
        </EmptyState>
      );
    }

    return (
      <ul className="session-list">
        {items.map((session) => (
          <SessionCard key={session._id} session={session} eventName={session.eventId?.name}>
            <SessionActions
              session={session}
              isBookmarked={bookmarkedIds.has(session._id)}
              isRegistered={registeredIds.has(session._id)}
              onChanged={refresh}
            />
            {session.eventId && (
              <Link to={eventPath(session.eventId._id)} className="link">
                View event
              </Link>
            )}
          </SessionCard>
        ))}
      </ul>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="My schedule" subtitle="Sessions and workshops you registered for or saved" />
        <FilterChips options={TABS} value={tab} onChange={setTab} label="Show registered or bookmarked sessions" />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default MySchedulePage;