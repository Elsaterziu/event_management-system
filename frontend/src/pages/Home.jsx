import { Link } from "react-router-dom";
import { useEffect } from "react";
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const cards = document.querySelectorAll(".fade-up-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            entry.target.style.transitionDelay = `${index * 0.12}s`;
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
        minHeight: "100vh",
      }}
    >
      <style>
        {`
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-35px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(35px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes floatY {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes pulseGlow {
            0% { box-shadow: 0 10px 24px rgba(37,99,235,0.18); }
            50% { box-shadow: 0 18px 38px rgba(37,99,235,0.28); }
            100% { box-shadow: 0 10px 24px rgba(37,99,235,0.18); }
          }

          .hero-left {
            animation: fadeInLeft 0.9s ease;
          }

          .hero-right {
            animation: fadeInRight 1s ease;
          }

          .floating-card {
            animation: floatY 4.5s ease-in-out infinite;
          }

          .primary-btn {
            animation: pulseGlow 2.8s ease-in-out infinite;
            transition: all 0.25s ease;
          }

          .primary-btn:hover {
            transform: translateY(-2px) scale(1.02);
          }

          .secondary-btn {
            transition: all 0.25s ease;
          }

          .secondary-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 22px rgba(15,23,42,0.08);
            border-color: #94a3b8;
          }

          .fade-up-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.7s ease;
          }

          .hover-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .hover-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 18px 35px rgba(15,23,42,0.08);
          }

          .mini-stat:hover {
            transform: translateY(-4px);
          }
        `}
      </style>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "70px 30px 30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "34px",
          alignItems: "center",
        }}
      >
        <div className="hero-left">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: "700",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            Smart Event Platform
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: "1.08",
              marginBottom: "18px",
              color: "#0f172a",
              letterSpacing: "-1px",
            }}
          >
            Discover, Join, and Manage Events Effortlessly
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: "#475569",
              maxWidth: "620px",
              marginBottom: "30px",
            }}
          >
            EventMS helps users explore upcoming events, register in seconds,
            and manage their participation, while admins can organize and
            control everything from one clean and modern dashboard.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "26px",
            }}
          >
            <Link to="/events">
              <button
                className="primary-btn"
                style={{
                  padding: "14px 26px",
                  border: "none",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Explore Events
                <FaArrowRight />
              </button>
            </Link>

            {!user && (
              <Link to="/register">
                <button
                  className="secondary-btn"
                  style={{
                    padding: "14px 24px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "14px",
                    background: "white",
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  Join Now
                </button>
              </Link>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {[
              "Fast registration",
              "Modern dashboard",
              "Easy event discovery",
            ].map((item) => (
              <div
                key={item}
                className="mini-stat"
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "999px",
                  padding: "10px 14px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 6px 14px rgba(15,23,42,0.04)",
                  transition: "all 0.25s ease",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="hero-right floating-card"
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a, #2563eb)",
              borderRadius: "28px",
              padding: "30px",
              color: "white",
              boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-30px",
                width: "160px",
                height: "160px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "50%",
              }}
            ></div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                color: "#dbeafe",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "18px",
                position: "relative",
                zIndex: 2,
              }}
            >
              Trusted by event organizers
            </div>

            <h2
              style={{
                marginBottom: "20px",
                fontSize: "28px",
                position: "relative",
                zIndex: 2,
              }}
            >
              Why choose EventMS?
            </h2>

            <div style={{ display: "grid", gap: "16px", position: "relative", zIndex: 2 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <h3 style={{ marginBottom: "8px" }}>Easy Event Discovery</h3>
                <p style={{ margin: 0, lineHeight: "1.6", color: "#e2e8f0" }}>
                  Browse conferences, workshops, seminars, and social events in
                  one place.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <h3 style={{ marginBottom: "8px" }}>Fast Registration</h3>
                <p style={{ margin: 0, lineHeight: "1.6", color: "#e2e8f0" }}>
                  Register quickly and manage your joined events with ease.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <h3 style={{ marginBottom: "8px" }}>Powerful Admin Control</h3>
                <p style={{ margin: 0, lineHeight: "1.6", color: "#e2e8f0" }}>
                  Create, edit, and manage events from one simple workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 30px 70px",
        }}
      >
        <div
          className="fade-up-card"
          style={{
            background: "linear-gradient(135deg, #ffffff, #f8fbff)",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            padding: "30px",
            boxShadow: "0 18px 45px rgba(15,23,42,0.07)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "18px",
          }}
        >
          {[
            { number: "150+", label: "Events Created" },
            { number: "2K+", label: "Active Users" },
            { number: "98%", label: "Satisfaction Rate" },
            { number: "24/7", label: "Easy Access" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontSize: "34px",
                  margin: "0 0 8px",
                  color: "#2563eb",
                  fontWeight: "800",
                }}
              >
                {item.number}
              </h3>
              <p style={{ margin: 0, color: "#475569", fontSize: "15px" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 30px 70px",
        }}
      >
        <div style={{ marginBottom: "22px" }}>
          <h2
            style={{
              fontSize: "34px",
              margin: "0 0 10px",
              color: "#0f172a",
            }}
          >
            Platform Highlights
          </h2>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Everything you need to browse, join, and manage events more easily.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            className="fade-up-card hover-card"
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "26px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "#2563eb",
                fontSize: "20px",
              }}
            >
              <FaCalendarAlt />
            </div>

            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>
              Browse Events
            </h3>
            <p style={{ color: "#475569", lineHeight: "1.7", margin: 0 }}>
              View upcoming events with details such as date, location, and
              available spots.
            </p>
          </div>

          <div
            className="fade-up-card hover-card"
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "26px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "#2563eb",
                fontSize: "20px",
              }}
            >
              <FaUsers />
            </div>

            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>
              Manage Participation
            </h3>
            <p style={{ color: "#475569", lineHeight: "1.7", margin: 0 }}>
              Users can register and later manage their joined events from one
              place.
            </p>
          </div>

          <div
            className="fade-up-card hover-card"
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "26px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "#2563eb",
                fontSize: "20px",
              }}
            >
              <FaMapMarkerAlt />
            </div>

            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>
              Admin Control
            </h3>
            <p style={{ color: "#475569", lineHeight: "1.7", margin: 0 }}>
              Admins can oversee events, update details, and track participants
              efficiently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;