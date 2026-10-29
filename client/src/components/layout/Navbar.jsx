import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo.jpg";
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

    // Admin ko sirf apne kaam ke links dikhte hain (public Events/Exhibitors dashboard aur footer se khulte hain).
  // Baaqi sab ko Events aur Exhibitors, aur apne role ke links
  const renderLinks = () => {
    if (user?.role === "admin") {
      return (
        <>
          <Link to={ROUTES.adminEvents} className="btn btn-ghost" onClick={closeMenu}>
            Manage events
          </Link>
          <Link to={ROUTES.adminExhibitors} className="btn btn-ghost" onClick={closeMenu}>
            Manage exhibitors
          </Link>
          <Link to={ROUTES.adminBookings} className="btn btn-ghost" onClick={closeMenu}>
            Bookings
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to={ROUTES.events} className="btn btn-ghost" onClick={closeMenu}>
          Events
        </Link>
        <Link to={ROUTES.exhibitors} className="btn btn-ghost" onClick={closeMenu}>
          Exhibitors
        </Link>
        {user?.role === "attendee" && (
          <Link to={ROUTES.myRegistrations} className="btn btn-ghost" onClick={closeMenu}>
            My registrations
          </Link>
        )}
        {user?.role === "exhibitor" && (
          <>
            <Link to={ROUTES.myCompany} className="btn btn-ghost" onClick={closeMenu}>
              My company
            </Link>
            <Link to={ROUTES.myBookings} className="btn btn-ghost" onClick={closeMenu}>
              My bookings
            </Link>
          </>
        )}
      </>
    );
  };

  // Desktop aur mobile dono menu mein yahi buttons dikhte hain, isliye ek hi jagah likhe hain
  const renderActions = () => {
    // Token check ho raha ho to kuch nahi dikhate, warna "Log in" ek pal ke liye chamak jata hai
    if (loading) return null;

    if (user) {
      return (
        <>
          <Link
            to={ROUTES.dashboard}
            className="btn btn-ghost"
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </>
      );
    }

    return (
      <>
        <Link to={ROUTES.login} className="btn btn-ghost" onClick={closeMenu}>
          Log in
        </Link>
        <Link
          to={ROUTES.register}
          className="btn btn-primary"
          onClick={closeMenu}
        >
          Sign up
        </Link>
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
          {renderLinks()}
          {renderActions()}
          <ThemeToggle />
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
            {menuOpen ? (
              <FiX size={22} aria-hidden="true" />
            ) : (
              <FiMenu size={22} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="navbar-mobile-menu">
          {renderLinks()}
          {renderActions()}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
