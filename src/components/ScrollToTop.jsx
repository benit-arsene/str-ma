import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroBottomRef = useRef(0);
  const location = useLocation();

  const computeHeroThreshold = () => {
    const hero = document.querySelector(".hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      heroBottomRef.current = rect.bottom + window.scrollY;
    } else {
      heroBottomRef.current = window.innerHeight * 0.6;
    }
  };

  const onScroll = () => {
    setIsVisible(window.scrollY > heroBottomRef.current);
  };

  useEffect(() => {
    computeHeroThreshold();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeHeroThreshold);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeHeroThreshold);
    };
  }, []);

  useEffect(() => {
    computeHeroThreshold();
    onScroll();
  }, [location.pathname]);

  return (
    <button
      type="button"
      className={`scroll-to-top ${isVisible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <span className="arrow">&#8593;</span>
    </button>
  );
};

export default ScrollToTop;
