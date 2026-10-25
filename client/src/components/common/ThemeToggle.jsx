import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

// Ek hi toggle poori app mein: Navbar, Sidebar, login page, sab jagah yahi lagayein
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <FiSun size={20} aria-hidden="true" /> : <FiMoon size={20} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;

    