import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/common/PageLoader";
import { ROUTES } from "../routePaths";

// Sirf login wale user dekh sakte hain. roles dein (jaise ["admin"]) to sirf wohi role dekh sakta hai
const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Token check ho raha hai: abhi login page par na bhejein, warna logged-in user bhi ek pal login dekhe ga
  if (loading) {
    return <PageLoader fullScreen text="Checking your session..." />;
  }

  // Login nahi: login page par bhejo, aur yaad rakho ke user kahan ja raha tha
  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  // Login hai magar role galat
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
