import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiHome,
  FiList,
  FiPackage,  FiMessageSquare,
  FiInbox
} from "react-icons/fi";
import PublicLayout from "../components/layout/PublicLayout";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../routePaths";
import AdminStats from "../components/admin/AdminStats";

// Har role ko wohi links dikhte hain jo ab tak bane hain. Naya page banne par yahan ek entry jod dein
const LINKS_BY_ROLE = {
  attendee: [
    {
      to: ROUTES.events,
      icon: FiCalendar,
      title: "Browse events",
      text: "See upcoming expos and register for them.",
    },
    {
      to: ROUTES.exhibitors,
      icon: FiBriefcase,
      title: "Find exhibitors",
      text: "Search companies by name, product or category.",
    },
    {
      to: ROUTES.myRegistrations,
      icon: FiClipboard,
      title: "My registrations",
      text: "Check or cancel the events you registered for.",
    },
    {
      to: ROUTES.mySchedule,
      icon: FiClock,
      title: "My schedule",
      text: "Your registered and bookmarked sessions.",
    },
    {
      to: ROUTES.messages,
      icon: FiMessageSquare,
      title: "Messages",
      text: "Ask the organizers a question or send feedback.",
    },
  ],
  exhibitor: [
    {
      to: ROUTES.myCompany,
      icon: FiHome,
      title: "My company",
      text: "Edit your profile, add products and upload your logo.",
    },
    {
      to: ROUTES.myBookings,
      icon: FiPackage,
      title: "My bookings",
      text: "See or cancel the booths you booked.",
    },
    {
      to: ROUTES.events,
      icon: FiCalendar,
      title: "Browse events",
      text: "Pick an event and book a booth.",
    },
    {
      to: ROUTES.exhibitors,
      icon: FiBriefcase,
      title: "Other exhibitors",
      text: "See the companies already on the platform.",
    },
    {
      to: ROUTES.messages,
      icon: FiMessageSquare,
      title: "Messages",
      text: "Ask the organizers a question or send feedback.",
    },
  ],
  admin: [
    {
      to: ROUTES.adminExhibitors,
      icon: FiCheckSquare,
      title: "Manage exhibitors",
      text: "Approve or reject company profiles.",
    },
    {
      to: ROUTES.adminEvents,
      icon: FiCalendar,
      title: "Manage events",
      text: "Create, edit and remove expos, with their sessions and booths.",
    },
    {
      to: ROUTES.adminBookings,
      icon: FiList,
      title: "Bookings",
      text: "See every booth booking and cancel if needed.",
    },
    {
      to: ROUTES.events,
      icon: FiCalendar,
      title: "Browse events",
      text: "See all expos.",
    },
    {
      to: ROUTES.adminInbox,
      icon: FiInbox,
      title: "Inbox",
      text: "Answer questions and read feedback.",
    },
  ],
};

const DashboardPage = () => {
  const { user } = useAuth();
  const links = LINKS_BY_ROLE[user.role] || [];

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader
          title={`Welcome, ${user.name}`}
          subtitle={`Logged in as ${user.role}`}
        />
        {/* Sirf admin ko ginti dikhti hai */}
        {user.role === "admin" && <AdminStats />}

        <div className="dashboard-grid">
          {links.map(({ to, icon: Icon, title, text }) => (
            <Link key={title} to={to} className="card dashboard-link">
              <Icon className="feature-icon" aria-hidden="true" />
              <h2 className="feature-title">{title}</h2>
              <p className="feature-text">{text}</p>
            </Link>
          ))}
        </div>

      </div>
    </PublicLayout>
  );
};

export default DashboardPage;
