import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Info,
  BookOpen,
  MapPin,
  Camera,
  Users,
  Clock,
  BadgeCheck,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "./footer";
import "./TourDetail.css";
import { fetchTourBySlug, fetchItinerary } from "../api/tours";

function TourDetail() {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);
  const [activeTab, setActiveTab] = useState("information");

  useEffect(() => {
    let cancelled = false;
    const loadTour = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTourBySlug(tourId);
        if (!cancelled) {
          setTour(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadTour();
    return () => {
      cancelled = true;
    };
  }, [tourId]);

  useEffect(() => {
    let cancelled = false;
    const loadItinerary = async () => {
      try {
        setItineraryLoading(true);
        setItineraryError(null);
        const data = await fetchItinerary(tourId);
        if (!cancelled) {
          setItinerary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setItineraryError(err.message);
        }
      } finally {
        if (!cancelled) {
          setItineraryLoading(false);
        }
      }
    };
    if (tourId) {
      loadItinerary();
    }
    return () => {
      cancelled = true;
    };
  }, [tourId]);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="tour-detail-hero" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={40} style={{ color: "#007bff", animation: "spin 1s linear infinite" }} />
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <section className="tour-detail-hero" style={{ minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#dc3545" }}>
          <AlertCircle size={40} />
          <p>{error === "Tour not found" ? "Tour not found" : "Failed to load tour"}</p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>{error}</p>
        </section>
      </>
    );
  }

  if (!tour) {
    return (
      <>
        <Navbar />
        <section className="tour-detail-hero" style={{ minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#6c757d" }}>
          <p>Tour not available</p>
        </section>
      </>
    );
  }

  const tourImage = tour.primary_image?.image_url ?? "";
  const destination = tour.destination_name ?? "";
  const price = tour.base_price ? `${tour.currency} ${tour.base_price}` : "";
  const duration = tour.duration_days ? `${tour.duration_days} days` : "";
  const groupSize = tour.group_size ? `${tour.group_size}${tour.group_size_is_minimum ? "+" : ""} People` : "";
  const categories = tour.categories ?? [];

  return (
    <>
      <Navbar />

      <section
        className="tour-detail-hero"
        style={{ backgroundImage: `url("${tourImage}")` }}
      >
        <div className="tour-detail-hero-overlay">
          <h1>{tour.name}</h1>
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
                      <h1>{tour.name}</h1>
                    </div>

                    <div className="tour-price">
                      <strong>{price}</strong>
                      <span>Per Person</span>
                    </div>
                  </div>

                  {/* Tour highlights */}
                  <div className="tour-highlights">
                    <div className="highlight-item">
                      <Clock />
                      <strong>{duration}</strong>
                    </div>

                    <div className="highlight-item">
                      <Users />
                      <strong>{groupSize}</strong>
                    </div>

                    <div className="highlight-item">
                      <MapPin />
                      <strong>{destination}</strong>
                    </div>

                    <div className="highlight-item">
                      <BadgeCheck />
                      <strong>{categories.map(c => c.name).join(", ") || "General"}</strong>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="tour-information-text">
                    <h2>Tour Information</h2>
                    {tour.full_description ? (
                      <p>{tour.full_description}</p>
                    ) : (
                      <p>No detailed description available for this tour.</p>
                    )}
                    {tour.short_description && tour.short_description !== tour.full_description && (
                      <p>{tour.short_description}</p>
                    )}
                  </div>

                  {/* Video - keep static if available */}
                  <div className="tour-video">
                    <video autoPlay muted loop playsInline>
                      <source src="/videos/video.mp4" type="video/mp4" />
                    </video>
                  </div>

                  {/* Specifications - only show what we have from API */}
                  <div className="tour-specifications">
                    <div className="spec-row">
                      <div className="spec-label">Destination</div>
                      <div className="spec-value">{destination}</div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Duration</div>
                      <div className="spec-value">{duration}</div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Group Size</div>
                      <div className="spec-value">{groupSize}</div>
                    </div>

                    <div className="spec-row">
                      <div className="spec-label">Categories</div>
                      <div className="spec-value">
                        {categories.length > 0 ? (
                          <ul className="included-list">
                            {categories.map((cat) => (
                              <li key={cat.slug}>
                                <Check />
                                {cat.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "General"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tour-plan" && (
                <div className="tour-plan">
                  {itineraryLoading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#007bff" }}>
                      <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
                      <p>Loading itinerary...</p>
                    </div>
                  ) : itineraryError ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#dc3545" }}>
                      <AlertCircle size={32} style={{ marginBottom: "12px" }} />
                      <p>Failed to load itinerary</p>
                      <p style={{ fontSize: "14px", opacity: 0.8 }}>{itineraryError}</p>
                    </div>
                  ) : itinerary.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>
                      <BookOpen size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                      <p>No itinerary available for this tour.</p>
                      <p style={{ fontSize: "14px" }}>Detailed day-by-day plan will be added when available.</p>
                    </div>
                  ) : (
                    <div style={{ padding: "20px" }}>
                      {itinerary.map((day, index) => (
                        <div key={`${day.day_number}-${index}`} className="itinerary-day" style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: index < itinerary.length - 1 ? "1px solid #eee" : "none" }}>
                          <div className="itinerary-day-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <span className="day-number" style={{ background: "#007bff", color: "white", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                              {day.day_number ?? index + 1}
                            </span>
                            <div>
                              <h3 style={{ margin: 0, fontSize: "18px" }}>{day.day_label ?? `Day ${day.day_number ?? index + 1}`}</h3>
                              {day.title && <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "600", color: "#333" }}>{day.title}</p>}
                            </div>
                          </div>
                          {day.description && (
                            <div className="itinerary-day-description" style={{ marginLeft: "48px", color: "#555", lineHeight: "1.6" }}>
                              <p style={{ margin: 0 }}>{day.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "location" && (
                <div className="tour-location">
                  <h2>Tour Location</h2>
                  <div className="map-container">
                    <div style={{ width: "100%", height: "450px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c757d", backgroundColor: "#f8f9fa" }}>
                      <p>Map integration requires Google Maps API key. Location: {destination}</p>
                    </div>
                    <div className="map-location-card">
                      <div>
                        <h3>{destination}</h3>
                        <p>{destination}</p>
                      </div>
                    </div>
                    <div>
                      <h2>About This Destination</h2>
                      <p>Detailed destination information will be added when available.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <div>
                  <h3>Make Your <strong>Own Memories</strong></h3>
                  <div className="tour-gallery">
                    <div className="gallery-images">
                      {tour.primary_image?.image_url ? (
                        <img
                          src={tour.primary_image.image_url}
                          alt={tour.primary_image.alt_text || `${tour.name} tour view`}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "#6c757d", backgroundColor: "#f8f9fa" }}>
                          No images available for this tour
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "review" && (
                <div className="tour-reviews">
                  <div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                    <p>Customer reviews are not available for this tour yet.</p>
                    <p style={{ fontSize: "14px" }}>Reviews will appear here when customers share their experiences.</p>
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

            <form onSubmit={(event) => event.preventDefault()}>
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