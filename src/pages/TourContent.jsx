import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "./TourContent.css";
import "./pagination.css";
import Pagination from "./pagination";
import { Link } from "react-router-dom";
import { fetchTours } from "../api/tours";

function TourContent() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    let cancelled = false;
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTours();
        if (!cancelled) {
          setTours(data);
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
    loadTours();
    return () => {
      cancelled = true;
    };
  }, []);

  const mapApiTour = (tour) => {
    const groupSuffix = tour.group_size_is_minimum ? "+" : "";
    return {
      image: tour.primary_image?.image_url ?? "",
      location: tour.destination_slug?.toUpperCase() ?? "",
      title: tour.name ?? "",
      description: tour.short_description ?? "",
      duration: `${tour.duration_days ?? 0} days`,
      groupSize: `${tour.group_size ?? 0}${groupSuffix} People`,
      price: `${tour.currency ?? "USD"} ${tour.base_price ?? 0}`,
      discount: null,
      categories: tour.categories ?? [],
      slug: tour.slug ?? "",
    };
  };

  const mappedTours = tours.map(mapApiTour);
  const totalPages = Math.ceil(mappedTours.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTours = mappedTours.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <section className="tour-content" style={{ padding: "60px 6%" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <Loader2 size={40} style={{ color: "#007bff", animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: "12px", fontSize: "18px" }}>Loading tours...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tour-content" style={{ padding: "60px 6%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#dc3545" }}>
          <AlertCircle size={40} />
          <p>Failed to load tours</p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>{error}</p>
        </div>
      </section>
    );
  }

  if (mappedTours.length === 0) {
    return (
      <section className="tour-content" style={{ padding: "60px 6%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#6c757d" }}>
          <p>No tours available</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="tour-content">
        <div className="tour-list">
          <div className="sort-group">
            <span className="sort-label">Sort by :</span>

            <select defaultValue="release" className="sort-select">
              <option value="release">Release Date</option>
              <option value="price">Price</option>
            </select>

            <select defaultValue="descending" className="sort-select">
              <option value="descending">Descending</option>
              <option value="ascending">Ascending</option>
            </select>
          </div>

          {/* Cards */}
          <div className="tour-cards">
            {visibleTours.map((tour, index) => (
              <div
                className="tour-card"
                key={`${tour.location}-${tour.price}-${startIndex + index}`}
                style={{ "--reveal-delay": `${index * 150}ms` }}
              >
                <div className="tour-card-image">
                  <img src={tour.image} alt={tour.location} />

                  {tour.discount && (
                    <span className="discount">{tour.discount}</span>
                  )}

                  <span className="location">{tour.location}</span>
                </div>

                <div className="tour-card-body">
                  <h2>{tour.title}</h2>

                  <p>{tour.description}</p>

                  <div className="tour-meta">
                    <span>
                      <Clock size={16} />
                      <span>
                        <b>Duration</b>
                        {tour.duration}
                      </span>
                    </span>

                    <span>
                      <Users size={16} />
                      <span>
                        <b>Group Size</b>
                        {tour.groupSize}
                      </span>
                    </span>
                  </div>

                  <div className="tour-footer">
                    <strong>{tour.price}</strong>

                    <Link
                      to={`/tours/${tour.location.toLowerCase()}`}
                      className="book-button"
                    >
                      BOOK NOW
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside className="tour-sidebar">
          <div className="find-tour">
            <h2>
              <span></span>
              FIND YOUR TOUR
            </h2>
            <div className="search-input">
              <Search size={18} />
              <input placeholder="Search Tour" />
            </div>
            <div className="search-input">
              <MapPin size={18} />
              <input placeholder="Where To?" />
            </div>
            <div className="select-input">
              <CalendarDays size={18} />

              <select defaultValue="">
                <option value="" disabled>
                  Month
                </option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
            <label className="filter-label">Duration</label>
            <select className="duration-select">
              <option>Any</option>
              <option>1 - 3 Days</option>
              <option>4 - 7 Days</option>
              <option>7+ Days</option>
            </select>
            <div className="price-inputs">
              <input type="number" placeholder="Min Price" defaultValue="1" />
              <input type="number" placeholder="Max Price" defaultValue="100" />
            </div>
            <div className="categories">
              <label>
                <input type="checkbox" />
                Cultural
              </label>

              <label>
                <input type="checkbox" />
                Adventure
              </label>

              <label>
                <input type="checkbox" />
                Historical
              </label>

              <label>
                <input type="checkbox" />
                Seaside
              </label>

              <label>
                <input type="checkbox" />
                Discovery
              </label>
            </div>
            <button className="find-button">FIND NOW</button>
          </div>

          <div className="why-book">
            <h2>Why Book With Us?</h2>

            <ul>
              <li>Best Price Guarantee</li>
              <li>Customer care available 24/7</li>
              <li>Free Travel Insurance</li>
              <li>Hand-picked Tours & Activities</li>
            </ul>
          </div>

          <div className="question-card">
            <h2>
              <span></span>
              GET A QUESTION?
            </h2>

            <p>
              Do not hesitage to give us a call. We are an expert team and we
              are happy to talk to you.
            </p>

            <div className="question-contact">
              <div>
                <Mail />
                <span>holidayplanners@gmail.com</span>
              </div>

              <div>
                <Phone />
                <span>+123 456 7890</span>
              </div>
            </div>
          </div>
        </aside>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) =>
            setCurrentPage(Math.min(Math.max(page, 1), totalPages))
          }
        />
      </section>
    </>
  );
}

export default TourContent;
