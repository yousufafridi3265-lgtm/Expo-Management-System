import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo.jpg";
import NavItem from "./NavItem";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routePaths";

// Upar ki bar. Login ho to Dashboard + Log out, warna Log in + Sign up
const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  // Desktop aur mobile dono menu mein yahi buttons dikhte hain, isliye ek hi jagah likhe hain
  const renderActions = () => {
    // Token check ho raha ho to kuch nahi dikhate, warna "Log in" ek pal ke liye chamak jata hai
    if (loading) return null;

    if (user) {
      return (
        <>
          <NavItem to={ROUTES.dashboard} onClick={closeMenu} end>
            Dashboard
          </NavItem>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </>
      );
    }

    return (
      <>
        <NavItem to={ROUTES.login} onClick={closeMenu}>
          Log in
        </NavItem>
        <Link to={ROUTES.register} className="btn btn-primary" onClick={closeMenu}>
          Sign up
        </Link>
      </>
    );
  };

  // Admin ko sirf apne kaam ke links dikhte hain (public Events/Exhibitors dashboard aur footer se khulte hain).
  // Baaqi sab ko Events aur Exhibitors, aur apne role ke links
  const renderLinks = () => {
    if (user?.role === "admin") {
      return (
        <>
          <NavItem to={ROUTES.adminEvents} onClick={closeMenu}>
            Manage events
          </NavItem>
          <NavItem to={ROUTES.adminExhibitors} onClick={closeMenu}>
            Manage exhibitors
          </NavItem>
          <NavItem to={ROUTES.adminBookings} onClick={closeMenu}>
            Bookings
          </NavItem>
          <NavItem to={ROUTES.adminInbox} onClick={closeMenu}>
            Inbox
          </NavItem>
        </>
      );
    }

    return (
      <>
        <NavItem to={ROUTES.events} onClick={closeMenu}>
          Events
        </NavItem>
        <NavItem to={ROUTES.exhibitors} onClick={closeMenu}>
          Exhibitors
        </NavItem>
        {user?.role === "attendee" && (
          <NavItem to={ROUTES.myRegistrations} onClick={closeMenu}>
            My registrations
          </NavItem>
        )}
        {user?.role === "attendee" && (
          <NavItem to={ROUTES.mySchedule} onClick={closeMenu}>
            My schedule
          </NavItem>
        )}
        {(user?.role === "attendee" || user?.role === "exhibitor") && (
          <NavItem to={ROUTES.messages} onClick={closeMenu}>
            Messages
          </NavItem>
        )}
        {user?.role === "exhibitor" && (
          <>
            <NavItem to={ROUTES.myCompany} onClick={closeMenu}>
              My company
            </NavItem>
            <NavItem to={ROUTES.myBookings} onClick={closeMenu}>
              My bookings
            </NavItem>
          </>
        )}
      </>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={ROUTES.home} className="navbar-brand" onClick={closeMenu}>
          <img src={logo} alt="" className="navbar-logo" />
          <span>Expo Management</span>
        </Link>

        <div className="navbar-desktop">
          <nav className="navbar-links" aria-label="Main">
            {renderLinks()}
          </nav>
          <span className="navbar-divider" aria-hidden="true" />
          <div className="navbar-actions">
            {renderActions()}
            <ThemeToggle />
          </div>
        </div>

        <div className="navbar-mobile-controls">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="navbar-mobile-menu" aria-label="Main">
          {renderLinks()}
          <div className="navbar-mobile-actions">{renderActions()}</div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;