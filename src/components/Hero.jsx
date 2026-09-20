import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./Hero.css";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState("next");

  const slides = [
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM8ax1cYXOTtcAl9FoMEDHQvWkyEAy7v3RBcR5tU9ogQ&s=10",
      title: "Life is Short and",
      highlight: "The World is Wide.",
      description:
        "Experience the beauty of the ocean with our coastal tours and unforgettable escapes.",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHNgxHPDleuzOt6LbOYkeBdBcWP-ltwlrbMPSij_NePSA9Ie4Whp6ow-g&s=10",
      title: "Kigali, Rwanda - You Will Visit Us Once",
      highlight: "Come and See.",
      description:
        "Explore vibrant cities, breathtaking landscapes, and carefully planned adventures across China.",
    },
    {
      image: "https://locatify.com/wp-content/uploads/2023/11/1.jpg",
      title: "In this World",
      highlight: "Good things are given .",
      description:
        "Discover London through iconic streets, rich history, and unforgettable cultural moments.",
    },
  ];

  const changeSlide = (nextIndex, nextDirection) => {
    setDirection(nextDirection);
    setCurrentSlide(nextIndex);
  };

  useEffect(() => {
    const moving = setInterval(() => {
      setDirection("next");
      setCurrentSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 3000);

    return () => clearInterval(moving);
  }, [slides.length]);

  // Shared slide motion for the background image AND the text, so they move
  // together. The new slide enters from `direction`; the old one exits opposite.
  const slideIn = (dir) => ({
    initial: { opacity: 0, x: dir === "next" ? "100%" : "-100%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: dir === "next" ? "-100%" : "100%" },
  });

  return (
    <section className="hero" data-reveal>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="hero-bg"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
          }}
          {...slideIn(direction)}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div className="hero-overlay" />

      <button
        className="hero-prev"
        onClick={() =>
          changeSlide(
            (currentSlide - 1 + slides.length) % slides.length,
            "prev",
          )
        }
      >
        Prev
      </button>

      <div className="hero-copy">
        <AnimatePresence initial={false}>
          <motion.h1
            key={`title-${currentSlide}`}
            {...slideIn(direction)}
            transition={{ duration: 0.7, ease: "easeInOut"}}
          >
            <span className="hero-title-line">
              {slides[currentSlide].title}
            </span>
            <span className="hero-title-box">
              {slides[currentSlide].highlight}
            </span>
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            {...slideIn(direction)}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {slides[currentSlide].description}
          </motion.p>
        </AnimatePresence>
      </div>

      <button
        className="hero-next"
        onClick={() => changeSlide((currentSlide + 1) % slides.length, "next")}
      >
        Next
      </button>
    </section>
  );
}

export default Hero;
