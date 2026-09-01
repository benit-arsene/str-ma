import { X, ChevronDown, ChevronUp } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Menu.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Menu({ onClose, isClosing = false }) {
  const location = useLocation();
  const [isTourOpen, setIsTourOpen] = useState(
    location.pathname.startsWith("/tour") || true,
  );

  return (
    <div className={`menu-overlay ${isClosing ? "menu-overlay-closing" : ""}`}>
      <div className="menu-overlay-art" aria-hidden="true">
        <img src="/2439302c-a15f-4b73-b4b1-4333339353e4.svg" alt="" />
      </div>

      <div className="menu-top">
        <div className="menu-brand" aria-label="Holiday Planners">
          Holiday <span className="menu-brand-highlight">P</span>lanners
        </div>

        <button className="menu-close" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="menu-content">
        <div className="menu-links">
          <Link to="/">Home</Link>

          <Link to="/about">About</Link>

          <Link to="/destinations">
            Destinations
            <ChevronDown />
          </Link>

          <button
            className={`menu-parent ${isTourOpen ? "active" : ""}`}
            onClick={() => setIsTourOpen((isOpen) => !isOpen)}
            type="button"
          >
            <span>Tour</span>
            {isTourOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {isTourOpen && (
            <div className="menu-sub-links">
              <Link to="/tour" onClick={onClose}>
                Tour
              </Link>
              <Link to="/tour/italy" onClick={onClose}>
                Tour Detail
              </Link>
            </div>
          )}

          <Link to="/blog">
            Blog
            <ChevronDown />
          </Link>

          <Link to="/contact">Contact us</Link>
        </div>
        <div className="menu-socials">
          <button>
            <FaFacebookF />
          </button>

          <button>
            <FaInstagram />
          </button>

          <button>
            <FaTwitter />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
