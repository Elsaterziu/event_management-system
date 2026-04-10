import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/register", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage(response.data.message || "Registered successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          padding: "36px",
          borderRadius: "24px",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.10)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              margin: "0 0 10px 0",
              color: "#0f172a",
              fontSize: "30px",
              fontWeight: "700",
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              color: "#64748b",
              margin: 0,
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            Create your account and start exploring events.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#166534",
              border: "1px solid #bbf7d0",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "15px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "15px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "15px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "15px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
              transition: "0.3s ease",
            }}
          >
            Register
          </button>
        </form>

        <p
          style={{
            marginTop: "22px",
            color: "#475569",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;