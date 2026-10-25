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

  // Desktop aur mobile dono menu mein yahi buttons dikhte hain, isliye ek hi jagah likhe hain
  const renderActions = () => {
    // Token check ho raha ho to kuch nahi dikhate, warna "Log in" ek pal ke liye chamak jata hai
    if (loading) return null;

    if (user) {
      return (
        <>
          <Link to={ROUTES.dashboard} className="btn btn-ghost" onClick={closeMenu}>
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
        <Link to={ROUTES.register} className="btn btn-primary" onClick={closeMenu}>
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
            {menuOpen ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && <nav className="navbar-mobile-menu">{renderActions()}</nav>}
    </header>
  );
};

export default Navbar;