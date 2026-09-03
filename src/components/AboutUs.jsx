import "./aboutUs.css";
import { MapPin, User, Calendar } from "lucide-react";

function AboutUs() {
  return (
    <>
      <div className="search-container">
        <form className="search-form">
          <div className="search-field">
            <span className="field-icon">
              <MapPin />
            </span>
            <input type="text" placeholder="Where To?" />
          </div>
          <div className="search-field">
            <span className="field-icon">
              <Calendar />
            </span>
            <select>
              <option>When?</option>
              <option> January</option>
              <option> February</option>
              <option> March</option>
              <option> April</option>
              <option> May</option>
              <option> June</option>
            </select>
          </div>
          <div className="search-field">
            <span className="field-icon">
              <User />
            </span>
            <select>
              <option>Travel Type</option>
              <option> Adventure</option>
              <option> Relaxation</option>
              <option> Culture</option>
            </select>
          </div>
          <button type="submit" className="btn-search">
            FIND NOW
          </button>
        </form>
      </div>

      <section className="about-section">
        <div className="about-images">
          <div className="main-image-frame">
            <img
              src="/8eab4b81-ba64-420d-ae9f-1be5197e8268.jpg"
              alt="Train Station"
            />
          </div>
          <div className="sub-image-frame">
            <img
              src="/78576aa1-3b01-40eb-bd90-d9e806fedfb4.jpg"
              alt="Traveler"
            />
          </div>
        </div>

        <div className="about-content">
          <span className="sub-title">About us</span>
          <h2>Plan Your Trip with Us</h2>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts. Separated they
            live in Bookmarksgrove...
          </p>
          <button className="btn-gold">READ MORE</button>
        </div>
      </section>
    </>
  );
}

export default AboutUs;
