import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Info,
  BookOpen,
  MapPin,
  Camera,
  Users,
  Clock,
  UserPlus,
  BadgeCheck,
  Check,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "./footer";
import "./TourDetail.css";

const tourImages = {
  italy:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  greece:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
  switzerland:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
};

const specifications = {
  destination: "Greece",
  departure: "Greece",
  departureTime: "9:15 AM To 9:30 AM",
  returnTime: "7:00 PM",
  dressCode: "Casual",
  included: [
    "5 Star Accommodation",
    "Air fares",
    "3 Nights Hotel Accommodation",
    "All transportation in destination location",
  ],
  excluded: ["Guide Service Fee", "Any Private Expenses", "Room Service Fees"],
};
function TourDetail() {
  const { tourId } = useParams();
  const tourKey = tourId?.toLowerCase();
  const tourImage =
    tourImages[tourKey] ??
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

  const [activeTab, setActiveTab] = useState("information");

  const tabs = [
    {
      id: "information",
      label: "Information",
      icon: Info,
    },
    {
      id: "tour-plan",
      label: "Tour Plan",
      icon: BookOpen,
    },
    {
      id: "location",
      label: "Location",
      icon: MapPin,
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: Camera,
    },
    {
      id: "review",
      label: "Review",
      icon: Users,
    },
  ];
  const itinerary = [
    {
      number: 1,
      dayLabel: "Day 1",
      title: "Departure",
      desc: "I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now.",
    },
    {
      number: 2,
      dayLabel: "Day 2",
      title: "Adventure Beggins",
      desc: "I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now.",
    },
    {
      number: 3,
      dayLabel: "Day 3 - 7",
      title: "Historical Tour",
      desc: "I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless",
    },
    {
      number: 4,
      dayLabel: "Day 8 - 11",
      title: " City Tour",
      desc: "I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless",
    },
    {
      number: 5,
      dayLabel: "Day 12",
      title: " Return",
      desc: "I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless",
    },
  ];
  return (
    <>
      <Navbar />

      <section
        className="tour-detail-hero"
        style={{ backgroundImage: `url("${tourImage}")` }}
      >
        <div className="tour-detail-hero-overlay">
          <h1>{tourId}</h1>
        </div>
      </section>

      <section className="tour-detail-content">
        <div className="tour-detail-layout">
          {/* LEFT SIDE */}
          <div className="tour-detail-main">
            {/* Tabs */}
            <div className="tour-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    className={activeTab === tab.id ? "active" : ""}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="tour-tab-content">
              {activeTab === "information" && (
                <div className="information-content">
                  {/* Tour title + price */}
                  <div className="tour-title-section">
                    <div className="tour-title">
                      <h1>
                        A wonderful serenity has taken possession of my entire
                        soul
                      </h1>
                    </div>

                    <div className="tour-price">
                      <strong>$1200</strong>
                      <span>Per Person</span>
                    </div>

                    <div className="discount-badge">
                      <span>22%</span>
                      <span>Off</span>
                    </div>
                  </div>

                  {/* Tour highlights */}
                  <div className="tour-highlights">
                    <div className="highlight-item">
                      <Clock />
                      <strong>2 days</strong>
                    </div>

                    <div className="highlight-item">
                      <Users />
                      <strong>6 People</strong>
                    </div>

                    <div className="highlight-item">
                      <UserPlus />
                      <strong>18</strong>
                    </div>

                    <div className="highlight-item">
                      <MapPin />
                      <strong>Greece</strong>
                    </div>

                    <div className="highlight-item">
                      <BadgeCheck />
                      <strong>Discovery</strong>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="tour-information-text">
                    <h2>Tour Information</h2>

                    <p>
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts. Separated they live in Bookmarksgrove right at the
                      coast of the Semantics.
                    </p>

                    <p>
                      A small river named Duden flows by their place and
                      supplies it with the necessary regelialia.
                    </p>
                  </div>
                  <div className="tour-video">
                    <video autoPlay muted loop playsInline>
                      <source src="/videos/video.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div className="tour-specifications">
                    <div className="spec-row">
                      <div className="spec-label">Destination</div>
                      <div className="spec-value">
                        {specifications.destination}
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Departure</div>
                      <div className="spec-value">
                        {specifications.departure}
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Departure Time</div>
                      <div className="spec-value">
                        {specifications.departureTime}
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Return Time</div>
                      <div className="spec-value">
                        {specifications.returnTime}
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Dress Code</div>
                      <div className="spec-value">
                        {specifications.dressCode}
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Price Included</div>

                      <div className="spec-value">
                        <ul className="included-list">
                          {specifications.included.map((item) => (
                            <li key={item}>
                              <Check />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Price Not Included</div>

                      <div className="spec-value">
                        <ul className="excluded-list">
                          {specifications.excluded.map((item) => (
                            <li key={item}>
                              <X />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tour-plan" && (
                <div className="tour-plan">
                  {itinerary.map((item) => (
                    <div className="itinerary-item" key={item.number}>
                      <div className="itinerary-header">
                        <div className="day-badge">{item.number}</div>

                        <h2>
                          <strong>{item.dayLabel}</strong>
                          {":  "}
                          {item.title}
                        </h2>
                      </div>

                      <div className="itinerary-description">
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "location" && (
                <div className="tour-location">
                  <h2>Tour Location</h2>

                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps?q=India&t=&z=5&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      title="Tour Location"
                    ></iframe>

                    <div className="map-location-card">
                      <div>
                        <h3>India</h3>
                        <p>India</p>
                      </div>

                      <div className="map-actions">
                        <button title="Open in Google Maps">↗</button>

                        <button title="Directions">➤</button>
                      </div>
                    </div>
                    <div>
                      <h2>History Of The CIty</h2>
                      <p>
                        India has a rich history spanning thousands of years,
                        with influences from various cultures and civilizations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <div>
                  <h3>
                    Make Your <strong>Own Memories</strong>
                  </h3>
                  <div className="tour-gallery">
                    <div className="gallery-images">
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
                        alt={`${tourId} tour view 1`}
                      />
                      <img
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80"
                        alt={`${tourId} tour view 2`}
                      />
                      <img
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
                        alt={`${tourId} tour view 3`}
                      />
                      <img
                        src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=80"
                        alt={`${tourId} tour view 4`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "review" && (
                <div className="tour-reviews">
                  {/* Rating Summary */}
                  <div className="rating-summary">
                    <div className="overall-rating">
                      <strong>10.0</strong>
                      <span>Superb</span>
                    </div>

                    <div className="rating-breakdown">
                      {[
                        "Accommodation",
                        "Destination",
                        "Meals",
                        "Transport",
                        "Overall",
                        "Value for Money",
                      ].map((category) => (
                        <div className="rating-row" key={category}>
                          <span>{category}</span>

                          <div className="rating-bar">
                            <div className="rating-bar-fill"></div>
                          </div>

                          <span>10</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Reviews */}
                  <div className="customer-reviews">
                    <h2>Customer Reviews</h2>

                    <div className="review-item">
                      <div className="review-avatar">
                        <img src="" alt="John Doe" />
                      </div>

                      <div className="review-content">
                        <div className="review-header">
                          <div>
                            <h3>John Doe</h3>
                            <span>2 days ago</span>
                          </div>

                          <div className="review-stars">★★★★★</div>
                        </div>

                        <p>
                          Far far away, behind the word mountains, far from the
                          countries Vokalia and Consonantia, there live the
                          blind texts.
                        </p>
                      </div>
                    </div>

                    <div className="review-item">
                      <div className="review-avatar">
                        <img src="" alt="Jane Doe" />
                      </div>

                      <div className="review-content">
                        <div className="review-header">
                          <div>
                            <h3>Jane Doe</h3>
                            <span>5 days ago</span>
                          </div>

                          <div className="review-stars">★★★★★</div>
                        </div>

                        <p>
                          Far far away, behind the word mountains, far from the
                          countries Vokalia and Consonantia, there live the
                          blind texts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Comment */}
                  <div className="post-comment">
                    <h2>Post a Comment</h2>

                    <div className="comment-ratings">
                      {[
                        "Accommodation",
                        "Destination",
                        "Meals",
                        "Transport",
                        "Overall",
                        "Value for Money",
                      ].map((category) => (
                        <div className="comment-rating" key={category}>
                          <label>{category}</label>

                          <div className="star-picker">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button type="button" key={star}>
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form className="comment-form">
                      <div className="comment-fields">
                        <input type="text" placeholder="Your Name" />

                        <input type="email" placeholder="Your Email *" />

                        <input type="url" placeholder="Website" />
                      </div>

                      <textarea placeholder="Your Comment"></textarea>

                      <button type="submit">SUBMIT</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <aside className="book-tour-card">
            <h2 className="book-tour-title">
              <span></span>
              BOOK THIS TOUR
            </h2>

            <form>
              <input type="text" placeholder="Full Name" />

              <input type="email" placeholder="Email" />

              <input type="email" placeholder="Confirm Email" />

              <input type="tel" placeholder="Phone" />

              <input type="date" />

              <input type="number" placeholder="Number Of Tickets" />

              <textarea placeholder="Message"></textarea>

              <label className="availability">
                <input type="checkbox" />
                <span>Check Availability</span>
              </label>

              <button type="submit">BOOK NOW</button>
            </form>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default TourDetail;
