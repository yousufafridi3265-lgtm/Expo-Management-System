import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/common/PageLoader";
import { ROUTES } from "../routePaths";

// Login/Register page: jo pehle se login hai usay yahan nahi rukna chahiye
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader fullScreen text="Checking your session..." />;
  }

  if (user) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
};

export default GuestRoute;