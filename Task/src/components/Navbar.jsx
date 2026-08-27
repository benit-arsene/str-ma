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
            <a href="mailto:holidayplanners@gmail.com">
              <Mail />
              holidayplanners@gmail.com
            </a>
            <a href="tel:+1234567890">
              <Phone />
              +123 456 7890
            </a>
          </div>
          <div className="socials">
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
        <div className="main-nav">
          <div className="brand">
            <MapPin /> <span>Holiday Planners</span>
          </div>
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
