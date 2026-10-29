import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiHome,
  FiList,
  FiPackage,
} from "react-icons/fi";
import PublicLayout from "../components/layout/PublicLayout";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../routePaths";

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
      text: "Create, edit and remove expos, and their booths.",
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

        <div className="dashboard-grid">
          {links.map(({ to, icon: Icon, title, text }) => (
            <Link key={title} to={to} className="card dashboard-link">
              <Icon className="feature-icon" aria-hidden="true" />
              <h2 className="feature-title">{title}</h2>
              <p className="feature-text">{text}</p>
            </Link>
          ))}
        </div>

        {user.role !== "attendee" && (
          <p className="dashboard-note">
            More tools for your role are on the way.
          </p>
        )}
      </div>
    </PublicLayout>
  );
};

export default DashboardPage;
