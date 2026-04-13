import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
    color: isActive ? "#2563eb" : "#334155",
    fontWeight: isActive ? "700" : "500",
    padding: "8px 12px",
    borderRadius: "10px",
    background: isActive ? "#eff6ff" : "transparent",
    transition: "all 0.2s ease",
  });

  return (
    <nav
      style={{
        padding: "16px 32px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/" style={navLinkStyle} end>
            Home
          </NavLink>

          <NavLink to="/events" style={navLinkStyle}>
            Events
          </NavLink>

          {user && (
            <NavLink to="/assistant" style={navLinkStyle}>
              Assistant
            </NavLink>
          )}

          {user?.role === "user" && (
            <NavLink to="/my-events" style={navLinkStyle}>
              My Events
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin" style={navLinkStyle}>
              Admin Dashboard
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink to="/login" style={navLinkStyle}>
                Login
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
                  Register
                </button>
              </NavLink>
            </>
          ) : (
            <>
              <span style={{ color: "#475569" }}>
                Welcome, <strong>{user.name}</strong>
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
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;