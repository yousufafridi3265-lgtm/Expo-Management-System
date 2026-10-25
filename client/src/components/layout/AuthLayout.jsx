import logo from "../../assets/logo.jpg";
import ThemeToggle from "../common/ThemeToggle";

// Login aur Register dono isi dhanche mein: logo, title, card, aur neeche link
const AuthLayout = ({ title, subtitle, footer, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-brand">
        <img src={logo} alt="" className="auth-logo" />
        <span className="auth-brand-name">Expo Management</span>
      </div>

      <div className="card auth-card">
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
        {footer && <p className="auth-footer">{footer}</p>}
      </div>
    </div>
  );
};

export default AuthLayout;

