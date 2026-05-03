import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { t, i18n } = useTranslation();
  const [openLang, setOpenLang] = useState(false);
  const currentLang = i18n.language;

  const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem("lang", lng);
};

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#2563eb" : "#1e293b",
    fontWeight: "700",
    padding: "8px 14px",
    borderRadius: "10px",
    background: isActive ? "#eff6ff" : "transparent",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
  });

  return (
    <nav
      style={{
        padding: "16px 32px",
        borderBottom: "1px solid #e5e7eb",
        background: "linear-gradient(to right, #eff6ff, #f8fafc)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* LOGO */}
        <NavLink
          to="/"
          style={{
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          EventMS
        </NavLink>

        {/* LINKS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/" style={navLinkStyle} end>
            {t("home")}
          </NavLink>

          <NavLink to="/events" style={navLinkStyle}>
            {t("events")}
          </NavLink>

          {user && (
            <NavLink to="/assistant" style={navLinkStyle}>
              {t("assistant")}
            </NavLink>
          )}

          {user?.role === "user" && (
  <NavLink to="/my-events" style={navLinkStyle}>
    {t("myEvents")}
  </NavLink>
)}

{user?.role === "admin" && (
  <NavLink to="/admin" style={navLinkStyle}>
    {t("admin")}
  </NavLink>
)}

{!user ? (
  <>
    <NavLink to="/login" style={navLinkStyle}>
      {t("login")}
    </NavLink>

              <NavLink to="/register">
                <button
                  style={{
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {t("register")}
                </button>
              </NavLink>
            </>
          ) : (
            <>
              <span style={{ color: "#475569" }}>
                {t("welcome")}, <strong>{user.name}</strong>
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {t("logout")}
              </button>
            </>
          )}
          
          
        <div style={{ position: "relative" }}>
  {/* BUTTON */}
  <div
    onClick={() => setOpenLang(!openLang)}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      padding: "6px 10px",
      borderRadius: "8px",
      background: "#f1f5f9",
      fontWeight: "600",
      fontSize: "14px",
      color: "#334155",
    }}
  >
    <FaGlobe />
    {currentLang.toUpperCase()}
  </div>

  {/* DROPDOWN */}
  {openLang && (
    <div
      style={{
        position: "absolute",
        top: "40px",
        right: 0,
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        overflow: "hidden",
        minWidth: "100px",
        zIndex: 999,
      }}
    >
      {["en", "sq"].map((lng) =>
        lng !== currentLang ? (
          <div
            key={lng}
            onClick={() => {
              changeLanguage(lng);
              setOpenLang(false);
            }}
            style={{
              padding: "10px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            {lng.toUpperCase()}
          </div>
        ) : null
      )}
    </div>
  )}
</div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
