import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import "./App.css";
import Home from "./pages/Home";
import TourPage from "./pages/TourPage";
import TourDetail from "./pages/TourDetail";
import About from "./pages/About";
import DestinationsPage from "./pages/DestinationsPage";
import Reservation from "./pages/Reservation";
import ScrollToTop from "./components/ScrollToTop";
import { AdminAuthProvider } from "./context/AdminAuthProvider";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminReservationDetail from "./pages/admin/AdminReservationDetail";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "80px 6%",
        textAlign: "center",
      }}
    >
      <h1>404</h1>
      <p>We could not find the page you were looking for.</p>
      <Link to="/">Back to Home</Link>
    </main>
  );
}

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      revealItems.forEach((item) => observer.unobserve(item));
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/tour" element={<TourPage />} />
      <Route path="/tour/:tourId" element={<TourDetail />} />
      <Route path="/tours" element={<TourPage />} />
      <Route path="/tours/:tourId" element={<TourDetail />} />
      <Route path="/reservation" element={<Reservation />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route
          path="reservations/:id"
          element={<AdminReservationDetail />}
        />
        <Route path="finance" element={<AdminFinance />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
      <ScrollToTop />
    </BrowserRouter>
  );
}

export default App;
