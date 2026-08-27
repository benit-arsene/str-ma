import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPaypal,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
} from "react-icons/fa";
import { MapPin } from "lucide-react";

import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Column 1 */}
        <div className="footer-brand">
          <h2>
            <MapPin />
            <span>Holiday Planners</span>
          </h2>

          <p>
            <strong>Holiday Planners</strong> is your trusted travel partner,
            helping you discover amazing destinations and create unforgettable
            memories.
          </p>

          <form className="newsletter-form">
            <input type="email" placeholder="Enter Your Email" />
            <button type="submit">SUBMIT</button>
          </form>

          <div className="payment-icons">
            <FaPaypal title="PayPal" />
            <FaCcVisa title="Visa" />
            <FaCcMastercard title="Mastercard" />
            <FaCcAmex title="American Express" />
          </div>
        </div>

        {/* Column 2 */}
        <div className="footer-navigation">
          <h3>Navigation</h3>

          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Destination</a>
            </li>
            <li>
              <a href="/tours">Tour</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Contact us</a>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-contact">
          <h3>Need Help ?</h3>

          <div className="contact-item">
            <span>Call Us</span>
            <p>+123 456 7890</p>
          </div>

          <div className="contact-item">
            <span>Email for Us</span>
            <p>holidayplanners@gmail.com</p>
          </div>

          <div className="contact-item">
            <span>Location</span>
            <p>Main Street, Victoria 8007.</p>
          </div>

          <div className="follow-us">
            <span>Follow us</span>

            <div>
              <FaFacebookF />
              <FaInstagram />
              <FaTwitter />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>
          Copyright © 2021 <span>Geek Code Lab</span>. All Rights Reserved.
        </p>

        <div className="legal-links">
          <a href="#">Privacy Policy</a>
          <span>|</span>
          <a href="#">Terms of Use</a>
          <span>|</span>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
