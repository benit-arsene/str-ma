import { useState, useEffect } from "react";
import {
  MapPin,
  Shield,
  Headphones,
  Sparkles,
} from "lucide-react";
import "./Testimonials.css";

function Testimonials() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: MapPin,
      title: "Hand-Picked Destinations",
      description:
        "We carefully select each destination for its unique experiences, cultural richness, and natural beauty.",
    },
    {
      icon: Shield,
      title: "Travel with Confidence",
      description:
        "Best price guarantee, 24/7 customer support, and free travel insurance on every booking.",
    },
    {
      icon: Headphones,
      title: "Expert Local Guides",
      description:
        "Our knowledgeable guides bring destinations to life with insider stories and hidden gems.",
    },
    {
      icon: Sparkles,
      title: "Unforgettable Experiences",
      description:
        "From desert safaris to island hopping, we craft journeys that create lasting memories.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((current) => (current + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [features.length]);

  const feature = features[currentFeature];

  return (
    <section className="testimonials">
      <div className="testimonial-header">
        <h4>| Why Choose Us</h4>

        <h2>
          Travel <strong>with Confidence</strong>
        </h2>
      </div>

      <div className="testimonial-content">
        <div className="quote-icon">“”</div>

        <div className="review" key={currentFeature}>
          <div className="feature-icon" style={{ color: "#c29d59", fontSize: "40px", marginBottom: "25px" }}>
            <feature.icon size={40} />
          </div>

          <h3 style={{ color: "#c29d59", fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "15px" }}>
            {feature.title}
          </h3>

          <p style={{ color: "#777", maxWidth: "650px", fontSize: "16px", lineHeight: "1.8" }}>
            {feature.description}
          </p>

          <div className="testimonial-dots">
            {features.map((_, index) => (
              <button
                key={index}
                className={index === currentFeature ? "active" : ""}
                onClick={() => setCurrentFeature(index)}
                aria-label={`View feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;