import { Link } from "react-router-dom";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 30px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
          alignItems: "center",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: "bold",
              marginBottom: "18px",
            }}
          >
            Smart Event Platform
          </span>

          <h1
            style={{
              fontSize: "48px",
              lineHeight: "1.1",
              marginBottom: "18px",
              color: "#0f172a",
            }}
          >
            Discover, Join, and Manage Events with Ease
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: "#475569",
              maxWidth: "640px",
              marginBottom: "28px",
            }}
          >
            EventMS helps users explore upcoming events, register in seconds,
            and manage their participation, while admins can organize and
            control events from one clean dashboard.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/events">
              <button
                style={{
                  padding: "13px 22px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
                }}
              >
                Explore Events
              </button>
            </Link>

            {!user && (
              <Link to="/register">
                <button
                  style={{
                    padding: "13px 22px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    background: "white",
                    color: "#0f172a",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Join Now
                </button>
              </Link>
            )}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #0f172a, #2563eb)",
            borderRadius: "24px",
            padding: "32px",
            color: "white",
            boxShadow: "0 14px 40px rgba(15,23,42,0.18)",
          }}
        >
          <h2 style={{ marginBottom: "20px", fontSize: "28px" }}>
            Why choose EventMS?
          </h2>

          <div style={{ display: "grid", gap: "18px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Easy Event Discovery</h3>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#e2e8f0" }}>
                Browse conferences, workshops, and seminars in one place.
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
                Join events quickly and keep track of your registrations.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Powerful Admin Tools</h3>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#e2e8f0" }}>
                Create, edit, and manage events with a simple workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 30px 60px",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            marginBottom: "20px",
            color: "#0f172a",
          }}
        >
          Platform Highlights
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>Browse Events</h3>
            <p style={{ color: "#475569", lineHeight: "1.6" }}>
              View upcoming events with details such as date, location, and available spots.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>Manage Participation</h3>
            <p style={{ color: "#475569", lineHeight: "1.6" }}>
              Users can register and later manage their joined events from one place.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#0f172a" }}>Admin Control</h3>
            <p style={{ color: "#475569", lineHeight: "1.6" }}>
              Admins can oversee events, update details, and track participants efficiently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;