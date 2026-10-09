import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "./Destinations.css";
import { fetchDestinations } from "../api/tours";

function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback images keyed by destination slug (from original hardcoded data)
  const destinationImages = {
    greece: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpuBhszKEb8YEYa1gqfHLP9r-VxKT5-74FUnOXdZ8SULmYwTuRoKZOk6og&s=10",
    switzerland: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
    india: "https://www.agoda.com/wp-content/uploads/2024/04/Agra-cover-1244x700.jpg",
    thailand: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQSujSPrAkTmeam-MrAedSwZeDQuWZyX-He0bE7Ye04A&s=10",
    italy: "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
  };

  useEffect(() => {
    let cancelled = false;
    const loadDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDestinations();
        if (!cancelled) {
          setDestinations(data);
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
    loadDestinations();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="destinations" data-reveal>
      <h4>Amazing Destination</h4>
      <h2>Choose The Destination Just Right For Your Vacation</h2>
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Loader2 size={40} style={{ color: "#007bff", animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: "12px", fontSize: "18px" }}>Loading destinations...</span>
        </div>
      )}
      {error && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#dc3545", padding: "40px" }}>
          <AlertCircle size={40} />
          <p>Failed to load destinations</p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>{error}</p>
        </div>
      )}
      {!loading && !error && destinations.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#6c757d", padding: "40px" }}>
          <p>No destinations available</p>
        </div>
      )}
      {!loading && !error && destinations.length > 0 && (
        <>
          <div className="destinations-grid">
            {destinations.slice(0, 4).map((dest, index) => (
              <Link
                to="/tours"
                key={dest.slug}
                className={`destination-card card${index + 1}`}
                style={{ "--reveal-delay": `${index * 120}ms`, textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={destinationImages[dest.slug] ?? ""}
                  alt={dest.name}
                />
                <span>{dest.name}</span>
              </Link>
            ))}
          </div>
          <div>
            <Link to="/destinations" className="view-all" style={{ textDecoration: "none", color: "inherit" }}>
              VIEW ALL
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default Destinations;
