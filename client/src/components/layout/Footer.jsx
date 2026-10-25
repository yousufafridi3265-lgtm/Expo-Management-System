import { Link } from "react-router-dom";
import { ROUTES } from "../../routePaths";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; {new Date().getFullYear()} Expo Management System</p>
        <nav className="footer-links">
          <Link to={ROUTES.login} className="link">
            Log in
          </Link>
          <Link to={ROUTES.register} className="link">
            Sign up
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;