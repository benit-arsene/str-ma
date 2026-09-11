import React from "react";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className="scroll-to-top"
      onClick={handleClick}
      aria-label="Scroll to top"
    >
      <span className="arrow">&#8593;</span>
    </button>
  );
};

export default ScrollToTop;
