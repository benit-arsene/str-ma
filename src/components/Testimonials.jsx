import { useState, useEffect } from "react";
import "./Testimonials.css";

function Testimonials() {
  const [currentReview, setCurrentReview] = useState(0);

  const testimonials = [
    {
      name: "John Doe",
      review: "Far far away, behind the word mountains, far countries Vokalia.",
    },
    {
      name: "Jane Smith",
      review:
        "Traveling with Holiday Planners was an amazing experience. Everything was perfectly organized.",
    },
    {
      name: "Michael Brown",
      review:
        "An unforgettable journey with excellent service and beautiful destinations.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const review = testimonials[currentReview];

  return (
    <section className="testimonials">
      <div className="testimonial-header">
        <h4>| Testimonials</h4>

        <h2>
          Customer <strong>Reviews</strong>
        </h2>
      </div>

      <div className="testimonial-content">
        <div className="quote-icon">“”</div>

        <div className="review" key={currentReview}>
          <div className="stars">★ ★ ★ ★ ★</div>

          <p>{review.review}</p>

          <h3>{review.name}</h3>

          <span>Rated by travelers on facebook</span>

          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={index === currentReview ? "active" : ""}
                onClick={() => setCurrentReview(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
