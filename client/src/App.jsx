import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";
import { appRoutes } from "./routes.js";

// routes.js ki ek entry se uska page (aur zaroorat ho to guard) banata hai
const buildElement = ({ component: Page, access, roles, redirect }) => {
  if (redirect) return <Navigate to={redirect} replace />;
  if (access === "guest") return <GuestRoute><Page /></GuestRoute>;
  if (access === "auth") return <ProtectedRoute roles={roles}><Page /></ProtectedRoute>;
  return <Page />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={buildElement(route)} />
          ))}
        </Routes>

        {/* Poori app mein sirf ek Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)"
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;