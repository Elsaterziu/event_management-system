import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Footer() {
  const linkStyle = {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.25s ease",
    display: "inline-block",
    marginBottom: "12px",
  };

  const socialStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "16px",
    transition: "all 0.25s ease",
  };

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #0f172a, #111827)",
        color: "#f8fafc",
        marginTop: "70px",
        padding: "55px 24px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          alignItems: "start",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "24px",
              fontWeight: "700",
              letterSpacing: "0.3px",
            }}
          >
            EventMS
          </h2>
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "14px",
              lineHeight: "1.7",
              maxWidth: "260px",
            }}
          >
            Discover and manage events in a simple and modern way.
          </p>
        </div>

        <div>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "17px",
              color: "#ffffff",
            }}
          >
            Quick Links
          </h3>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link
              to="/"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#60a5fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#cbd5e1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Home
            </Link>

            <Link
              to="/events"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#60a5fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#cbd5e1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Events
            </Link>

            <Link
              to="/login"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#60a5fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#cbd5e1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#60a5fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#cbd5e1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Register
            </Link>
          </div>
        </div>

        <div>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "17px",
              color: "#ffffff",
            }}
          >
            Contact Us
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >
              <FaMapMarkerAlt color="#60a5fa" />
              <span>Prishtinë, Kosovë</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >
              <FaEnvelope color="#60a5fa" />
              <span>info@events.com</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >
              <FaPhone color="#60a5fa" />
              <span>+383 44 123 456</span>
            </div>
          </div>
        </div>

        <div>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "17px",
              color: "#ffffff",
            }}
          >
            Follow Us
          </h3>

          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              style={socialStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(96,165,250,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <FaFacebookF />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={socialStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(96,165,250,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <FaInstagram />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              style={socialStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(96,165,250,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "35px auto 0",
          paddingTop: "18px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        © 2026 EventMS. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;