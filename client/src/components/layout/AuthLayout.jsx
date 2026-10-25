import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import ThemeToggle from "../common/ThemeToggle";
import { ROUTES } from "../../routePaths";

// Login aur Register dono isi dhanche mein: logo, title, card, aur neeche link
// wide=true: lambi form ke liye card thora chora hota hai
const AuthLayout = ({ title, subtitle, footer, wide = false, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <Link to={ROUTES.home} className="auth-brand">
        <img src={logo} alt="" className="auth-logo" />
        <span className="auth-brand-name">Expo Management</span>
      </Link>

      <div className={`card auth-card ${wide ? "auth-card-wide" : ""}`}>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
        {footer && <p className="auth-footer">{footer}</p>}
      </div>
    </div>
  );
};

export default AuthLayout;