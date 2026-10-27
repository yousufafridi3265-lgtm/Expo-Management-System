import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiBriefcase,
  FiCalendar,
  FiGrid,
  FiMessageSquare,
  FiSearch,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routePaths";

// Yeh sab cheezen backend mein maujood hain. Jo feature backend mein nahi, woh yahan nahi likhte
const FEATURES = [
  {
    icon: FiCalendar,
    title: "Events",
    text: "Browse upcoming and ongoing expos with their dates and venues.",
  },
  {
    icon: FiSearch,
    title: "Find exhibitors",
    text: "Search companies by name, product or category.",
  },
  {
    icon: FiGrid,
    title: "Book booths",
    text: "Exhibitors reserve a booth online. A booth can never be booked twice.",
  },
  {
    icon: FiBookmark,
    title: "Sessions & workshops",
    text: "Bookmark sessions and register for workshops you want to attend.",
  },
  {
    icon: FiMessageSquare,
    title: "Inquiries",
    text: "Send a question to the organizers and read their reply.",
  },
  {
    icon: FiStar,
    title: "Feedback",
    text: "Tell the organizers what went well and what can improve.",
  },
];

const ROLES = [
  {
    icon: FiUsers,
    title: "Attendees",
    points: [
      "Register for events",
      "Search exhibitors",
      "Bookmark sessions",
      "Send feedback",
    ],
  },
  {
    icon: FiBriefcase,
    title: "Exhibitors",
    points: [
      "Create a company profile",
      "Show products and logo",
      "Book booths",
      "Track booking history",
    ],
  },
  {
    icon: FiShield,
    title: "Organizers",
    points: [
      "Manage events and booths",
      "Approve exhibitors",
      "Plan sessions",
      "Answer inquiries",
    ],
  },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <PublicLayout>
      <section className="hero">
        <h1 className="hero-title">Run and join expos, all in one place</h1>
        <p className="hero-text">
          Expo Management System connects attendees, exhibitors and organizers.
          Discover events, meet exhibitors and book your booth without
          paperwork.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to={ROUTES.dashboard} className="btn btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <Link to={ROUTES.register} className="btn btn-primary">
              Create an account
            </Link>
          )}
          <Link to={ROUTES.events} className="btn btn-secondary">
            Browse events
          </Link>
          <Link to={ROUTES.exhibitors} className="btn btn-secondary">
            Find exhibitors
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">About us</h2>
        <p className="home-section-text">
          Organizing an expo means handling events, companies, booths and
          visitors at the same time. This system keeps all of it in one place,
          so organizers stay in control, exhibitors get a fair booking process
          and attendees find what they came for.
        </p>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">What you can do</h2>
        <div className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card feature-card">
              <Icon className="feature-icon" aria-hidden="true" />
              <h3 className="feature-title">{title}</h3>
              <p className="feature-text">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Made for everyone at the expo</h2>
        <div className="feature-grid">
          {ROLES.map(({ icon: Icon, title, points }) => (
            <div key={title} className="card feature-card">
              <Icon className="feature-icon" aria-hidden="true" />
              <h3 className="feature-title">{title}</h3>
              <ul className="role-list">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className="cta-band">
          <h2 className="home-section-title">Ready to get started?</h2>
          <p className="home-section-text">
            Create an account as an attendee or an exhibitor.
          </p>
          <div className="hero-actions">
            <Link to={ROUTES.register} className="btn btn-primary">
              Sign up
            </Link>
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default HomePage;
