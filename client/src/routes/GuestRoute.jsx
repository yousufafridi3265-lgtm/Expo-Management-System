import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/common/PageLoader";
import { ROUTES } from "../routePaths";

// Login/Register page: jo pehle se login hai usay yahan nahi rukna chahiye
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader fullScreen text="Checking your session..." />;
  }

  // Login hote hi yeh route sab se pehle chalta hai. Agar user kisi page se login par aaya tha
  // (location.state.from) to wapas wahin bhejte hain, warna dashboard par
  if (user) {
    return <Navigate to={location.state?.from || ROUTES.dashboard} replace />;
  }

  return children;
};

export default GuestRoute;