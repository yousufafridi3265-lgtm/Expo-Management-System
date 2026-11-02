import { NavLink } from "react-router-dom";

// Navbar ka ek link. Jis page par aap hon wo apne aap "active" (rangeen) ho jata hai.
// Prefix match hota hai: /events/123 par bhi "Events" active rehta hai.
// end=true dein to sirf bilkul wohi page active hota hai
const NavItem = ({ to, children, onClick, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    >
      {children}
    </NavLink>
  );
};

export default NavItem;
