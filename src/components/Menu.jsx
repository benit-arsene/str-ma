import { X, ChevronDown, ChevronUp } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import "./Menu.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Menu({ onClose }) {
  const location = useLocation();
  const [isTourOpen, setIsTourOpen] = useState(
    location.pathname.startsWith("/tour"),
  );

  return (
    <div className="menu-overlay">
      <div className="menu-top">
        <div className="menu-brand">
          <img
            src="/ImageAssistant_Batch_Image_Downloader/html.geekcodelab.com/Holiday_Planners_-_Travel_Tour_HTML5_Template/10015.png"
            alt="Holiday Planners"
            className="menu-brand-logo"
          />
        </div>

        <button className="menu-close" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="menu-content">
        <div className="menu-links">
          <Link className="active" to="/">
            Home
          </Link>

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
            <FaXTwitter />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
