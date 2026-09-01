import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import TourPage from "./pages/TourPage";
import TourDetail from "./pages/TourDetail";

function App() {
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
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={<TourPage />} />
        <Route path="/tour/:tourId" element={<TourDetail />} />
        <Route path="/tours" element={<TourPage />} />
        <Route path="/tours/:tourId" element={<TourDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
