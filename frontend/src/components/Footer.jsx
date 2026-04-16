import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        marginTop: "50px",
        padding: "40px 20px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
        }}
      >
        {/* About */}
        <div>
          <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
            Event Management System
          </h3>
          <p style={{ color: "#cbd5e1", lineHeight: "1.6", fontSize: "14px" }}>
            A platform that helps users discover, organize, and manage events
            easily and efficiently.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
            Quick Links
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>
                Home
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link
                to="/events"
                style={{ color: "#cbd5e1", textDecoration: "none" }}
              >
                Events
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link
                to="/login"
                style={{ color: "#cbd5e1", textDecoration: "none" }}
              >
                Login
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link
                to="/register"
                style={{ color: "#cbd5e1", textDecoration: "none" }}
              >
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Contact</h3>
          <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
            <FaMapMarkerAlt style={{ marginRight: "8px" }} />
            Prishtinë, Kosovë
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
            <FaEnvelope style={{ marginRight: "8px" }} />
            info@events.com
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
            <FaPhone style={{ marginRight: "8px" }} />
            +383 44 123 456
          </p>
        </div>

        {/* Social Icons */}
        <div>
          <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Follow Us</h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#cbd5e1",
                fontSize: "20px",
                textDecoration: "none",
              }}
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#cbd5e1",
                fontSize: "20px",
                textDecoration: "none",
              }}
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#cbd5e1",
                fontSize: "20px",
                textDecoration: "none",
              }}
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #334155",
          marginTop: "30px",
          paddingTop: "15px",
          textAlign: "center",
          fontSize: "14px",
          color: "#94a3b8",
        }}
      >
        © 2026 Event Management System. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;