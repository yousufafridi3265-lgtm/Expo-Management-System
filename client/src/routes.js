import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import { ROUTES } from "./routePaths";

// App.jsx isi list se Route banata hai.
// access: "guest" (sirf bina login walay), "auth" (login zaroori), "public" (sab)
// roles: sirf in roles ko ijazat (access "auth" ke saath)
// redirect: component ke bajaye doosre path par bhej do
export const appRoutes = [
  { path: ROUTES.home, redirect: ROUTES.dashboard },
  { path: ROUTES.login, component: LoginPage, access: "guest" },
  { path: ROUTES.register, component: RegisterPage, access: "guest" },
  { path: ROUTES.dashboard, component: DashboardPage, access: "auth" },
  { path: "*", component: NotFoundPage, access: "public" }
];

