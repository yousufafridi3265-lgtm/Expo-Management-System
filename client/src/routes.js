import { lazy } from "react";
import { ROUTES } from "./routePaths";

// Lazy loading: har page ka code tab download hota hai jab user us page par jaye.
// Is se pehli dafa app khulna tez hota hai. App.jsx ka <Suspense> intezar ke dauran PageLoader dikhata hai
const HomePage = lazy(() => import("./pages/public/HomePage"));
const EventsPage = lazy(() => import("./pages/public/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/public/EventDetailPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotFoundPage = lazy(() => import("./pages/public/NotFoundPage"));

// App.jsx isi list se Route banata hai.
// access: "guest" (sirf bina login walay), "auth" (login zaroori), "public" (sab)
// roles: sirf in roles ko ijazat (access "auth" ke saath)
// redirect: component ke bajaye doosre path par bhej do
export const appRoutes = [
  { path: ROUTES.home, component: HomePage, access: "public" },
  { path: ROUTES.events, component: EventsPage, access: "public" },
  { path: ROUTES.eventDetail, component: EventDetailPage, access: "public" },
  { path: ROUTES.login, component: LoginPage, access: "guest" },
  { path: ROUTES.register, component: RegisterPage, access: "guest" },
  { path: ROUTES.dashboard, component: DashboardPage, access: "auth" },
  { path: "*", component: NotFoundPage, access: "public" }
];