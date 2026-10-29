import PageLoader from "./PageLoader";
import ErrorMessage from "./ErrorMessage";
import SessionCard from "./SessionCard";
import SessionActions from "./SessionActions";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { getMyBookmarks, getMySessionRegistrations, getSessions } from "../../apis/sessionApi";

const NO_DATA = () => Promise.resolve({ data: [] });

// Event ke page par us event ke sessions aur workshops ka schedule. Attendee ko bookmark aur register ke buttons milte hain
const EventSessions = ({ eventId }) => {
  const { user } = useAuth();
  const isAttendee = user?.role === "attendee";

  const sessionsRequest = useFetch(() => getSessions({ eventId }), [eventId]);
  // Bookmarks aur registrations sirf attendee ke liye hain. Baaqi logon ke liye khali list (koi request nahi jati)
  const bookmarksRequest = useFetch(isAttendee ? getMyBookmarks : NO_DATA, [isAttendee]);
  const registrationsRequest = useFetch(isAttendee ? getMySessionRegistrations : NO_DATA, [isAttendee]);

  if (sessionsRequest.loading) return <PageLoader text="Loading schedule..." />;
  if (sessionsRequest.error) return <ErrorMessage message={sessionsRequest.error} onRetry={sessionsRequest.reload} />;

  const sessions = sessionsRequest.data;
  if (sessions.length === 0) {
    return <p className="registration-note">No sessions have been scheduled for this event yet.</p>;
  }

  // Session ki id se jaldi pata karne ke liye (agar session baad mein delete ho gaya to sessionId null hoga)
  const bookmarkedIds = new Set((bookmarksRequest.data || []).map((item) => item.sessionId?._id));
  const registeredIds = new Set(
    (registrationsRequest.data || []).filter((item) => item.status === "registered").map((item) => item.sessionId?._id)
  );

  const refreshMine = () => {
    bookmarksRequest.reload();
    registrationsRequest.reload();
  };

  return (
    <ul className="session-list">
      {sessions.map((session) => (
        <SessionCard key={session._id} session={session}>
          {isAttendee && (
            <SessionActions
              session={session}
              isBookmarked={bookmarkedIds.has(session._id)}
              isRegistered={registeredIds.has(session._id)}
              onChanged={refreshMine}
            />
          )}
        </SessionCard>
      ))}
    </ul>
  );
};

export default EventSessions;