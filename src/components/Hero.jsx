import { useState, useEffect } from "react";
import "./Hero.css";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM8ax1cYXOTtcAl9FoMEDHQvWkyEAy7v3RBcR5tU9ogQ&s=10",
      title: "See the Sea",
      description: "Experience the beauty of the ocean with our coastal tours.",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHNgxHPDleuzOt6LbOYkeBdBcWP-ltwlrbMPSij_NePSA9Ie4Whp6ow-g&s=10",
      title: "Welcome to China",
      description: "Discover the beauty of China with our guided tours.",
    },
    {
      image: "https://locatify.com/wp-content/uploads/2023/11/1.jpg",
      title: "Explore London",
      description: "Immerse yourself in the culture and history of London.",
    },
  ];

  useEffect(() => {
    const moving = setInterval(() => {
      setCurrentSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 3000);

    return () => clearInterval(moving);
  }, []);

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${slides[currentSlide].image})`,
      }}
    >
      <button
        className="hero-prev"
        onClick={() =>
          setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)
        }
      >
        Previous
      </button>
      <h1>{slides[currentSlide].title}</h1>
      <p>{slides[currentSlide].description}</p>

      <button
        className="hero-next"
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
      >
        Next
      </button>
    </section>
  );
}

export default Hero;
