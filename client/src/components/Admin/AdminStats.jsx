import {
  FiBookmark,
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiGrid,
  FiInbox,
  FiList,
  FiMessageSquare,
  FiUsers
} from "react-icons/fi";
import StatCard from "./StatCard";
import PageLoader from "../common/PageLoader";
import ErrorMessage from "../common/ErrorMessage";
import useFetch from "../../hooks/useFetch";
import { getAdminStats } from "../../apis/adminApi";
import { ROUTES } from "../../routePaths";

// Admin dashboard ki ginti. Backend GET /api/admin/stats se
const AdminStats = () => {
  const { data: stats, loading, error, reload } = useFetch(getAdminStats);

  if (loading) return <PageLoader text="Loading statistics..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  return (
    <section aria-label="Statistics" className="stat-grid">
      <StatCard
        icon={FiUsers}
        label="Users"
        value={stats.users.total}
        detail={`${stats.users.attendee} attendees · ${stats.users.exhibitor} exhibitors · ${stats.users.admin} admins`}
      />
      <StatCard
        icon={FiCalendar}
        label="Events"
        value={stats.events.total}
        detail={`${stats.events.upcoming} upcoming · ${stats.events.ongoing} ongoing · ${stats.events.completed} completed · ${stats.events.cancelled} cancelled`}
        to={ROUTES.adminEvents}
      />
      <StatCard
        icon={FiBriefcase}
        label="Exhibitors"
        value={stats.exhibitors.total}
        detail={`${stats.exhibitors.pending} pending · ${stats.exhibitors.approved} approved · ${stats.exhibitors.rejected} rejected`}
        to={ROUTES.adminExhibitors}
        highlight={stats.exhibitors.pending > 0}
      />
      <StatCard
        icon={FiGrid}
        label="Booths"
        value={stats.booths.total}
        detail={`${stats.booths.available} available · ${stats.booths.booked} booked · ${stats.booths.unavailable} unavailable`}
      />
      <StatCard
        icon={FiList}
        label="Bookings"
        value={stats.bookings.total}
        detail={`${stats.bookings.confirmed} confirmed · ${stats.bookings.cancelled} cancelled`}
        to={ROUTES.adminBookings}
      />
      <StatCard
        icon={FiClipboard}
        label="Event registrations"
        value={stats.eventRegistrations.total}
        detail={`${stats.eventRegistrations.registered} active · ${stats.eventRegistrations.cancelled} cancelled`}
      />
      <StatCard icon={FiClock} label="Sessions" value={stats.sessions.total} />
      <StatCard
        icon={FiBookmark}
        label="Session registrations"
        value={stats.sessionRegistrations.total}
        detail={`${stats.sessionRegistrations.registered} active · ${stats.sessionRegistrations.cancelled} cancelled`}
      />
      <StatCard
        icon={FiInbox}
        label="Messages"
        value={stats.messages.total}
        detail={`${stats.messages.open} open · ${stats.messages.replied} replied`}
        to={ROUTES.adminInbox}
        highlight={stats.messages.open > 0}
      />
      <StatCard
        icon={FiMessageSquare}
        label="Feedback"
        value={stats.feedback.total}
        detail={`${stats.feedback.new} new · ${stats.feedback.reviewed} reviewed`}
        to={ROUTES.adminInbox}
        highlight={stats.feedback.new > 0}
      />
    </section>
  );
};

export default AdminStats;