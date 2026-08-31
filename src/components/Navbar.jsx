import { Search, Menu as MenuIcon, MapPin, Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Navbar.css";
import Menu from "./Menu";
import { useEffect, useState } from "react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
      document.body.classList.toggle("navbar-scrolled", scrolled);
      document.body.style.paddingTop = scrolled ? "80px" : "120px";
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("navbar-scrolled");
      document.body.style.paddingTop = "";
    };
  }, []);

  return (
    <>
      <nav className={isScrolled ? "navbar-scrolled" : ""}>
        <div className="contact-bar">
          <div className="contact">
            <a
              href="mailto:holidayplanners@gmail.com"
              className="email-of-holiday-planners"
            >
              <Mail />
              holidayplanners@gmail.com
            </a>
            <a href="tel:+1234567890" className="phone-of-holiday-planners">
              <Phone />
              +123 456 7890
            </a>
          </div>
          <div className="socials">
            <a
              className="Facebook-social"
              href="https://www.facebook.com"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              className="Instagram-social"
              href="https://www.instagram.com"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              className="Twitter-social"
              href="https://twitter.com"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
        <div className="main-nav">
          <a className="brand" href="/">
            <img
              src="/ImageAssistant_Batch_Image_Downloader/html.geekcodelab.com/Holiday_Planners_-_Travel_Tour_HTML5_Template/10004.png"
              alt="Holiday Planners logo"
              className="brand-logo"
            />
          </a>
          <div className="actions">
            <button>RESERVE</button>
            <Search />
            <MenuIcon
              className="menu-icon"
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
        </div>
      </nav>
      {isMenuOpen && <Menu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
}

export default Navbar;
