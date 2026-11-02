import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import SOCIAL_LINKS from "../../config/socialLinks";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routePaths";

// Neeche ki bar: company logo, chhota intro, social media icons aur kaam ke links
const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to={ROUTES.home} className="footer-brand-link">
            <img src={logo} alt="" className="footer-logo" />
            <span>Expo Management</span>
          </Link>
          <p className="footer-about">
            Discover events, meet exhibitors and book booths, all in one place for attendees,
            exhibitors and organizers.
          </p>

          {/* Sirf wohi icons jin ka url likha ho */}
          <ul className="footer-social" aria-label="Social media">
            {SOCIAL_LINKS.filter((item) => item.url).map(({ name, icon: Icon, url }) => (
              <li key={name}>
                <a
                  href={url}
                  className="footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} (opens in a new tab)`}
                  title={name}
                >
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer-column" aria-label="Explore">
          <h2 className="footer-heading">Explore</h2>
          <Link to={ROUTES.events} className="footer-link">
            Events
          </Link>
          <Link to={ROUTES.exhibitors} className="footer-link">
            Exhibitors
          </Link>
        </nav>

        <nav className="footer-column" aria-label="Account">
          <h2 className="footer-heading">Account</h2>
          {/* Login ho chuka ho to Log in / Sign up ki zaroorat nahi */}
          {user ? (
            <Link to={ROUTES.dashboard} className="footer-link">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to={ROUTES.login} className="footer-link">
                Log in
              </Link>
              <Link to={ROUTES.register} className="footer-link">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Expo Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;