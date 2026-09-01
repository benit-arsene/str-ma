import { useState } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import "./TourContent.css";
import "./pagination.css";
import Pagination from "./pagination";
import { Link } from "react-router-dom";

function TourContent() {
  const tours = [
    {
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      location: "ITALY",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "2 days",
      groupSize: "6 People",
      price: "$1200",
      discount: null,
    },
    {
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
      location: "GREECE",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "6 days 3 hours",
      groupSize: "15+ People",
      price: "$2500",
      discount: "15% off",
    },
    {
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      location: "ITALY",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "2 days",
      groupSize: "6 People",
      price: "$1200",
      discount: null,
    },
    {
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
      location: "SWITZERLAND",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "6 days 3 hours",
      groupSize: "15+ People",
      price: "$2500",
      discount: "15% off",
    },
    {
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      location: "ITALY",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "2 days",
      groupSize: "6 People",
      price: "$1200",
      discount: null,
    },
    {
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
      location: "SWITZERLAND",
      title: "Holiday Planners is a World Leading Online Tour Booking Platform",
      description:
        "Far far away, behind the word mountains, far countries Vokalia.",
      duration: "6 days 3 hours",
      groupSize: "15+ People",
      price: "$2500",
      discount: "15% off",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(tours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTours = tours.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <section className="tour-content" data-reveal>
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
                data-reveal
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
