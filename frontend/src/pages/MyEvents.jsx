import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
const [cancelId, setCancelId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMyEvents = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/users/${user.id}/registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error fetching my events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleCancelRegistration = async () => {
  try {
    await api.delete(`/registrations/${cancelId}`);

    setRegistrations((prev) =>
      prev.filter((r) => r.id !== cancelId)
    );

    toast.success("Registration cancelled!");

  } catch (error) {
    console.error(error);
    toast.error("Failed to cancel registration.");
  } finally {
    setCancelId(null);
  }
};

  const isUpcoming = (eventDate) => {
    if (!eventDate) return false;

    const event = new Date(eventDate);
    const today = new Date();

    event.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return event >= today;
  };

  const getEventImage = (event) => {
    if (!event?.image) {
      return "https://via.placeholder.com/400x220?text=No+Image";
    }

    const image = event.image;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/storage/")) {
      return `http://127.0.0.1:8000${image}`;
    }

    if (image.startsWith("storage/")) {
      return `http://127.0.0.1:8000/${image}`;
    }

    return `http://127.0.0.1:8000/storage/${image}`;
  };

  const stats = useMemo(() => {
    const total = registrations.length;
    const upcoming = registrations.filter((r) =>
      isUpcoming(r.event?.event_date)
    ).length;
    const past = total - upcoming;

    return { total, upcoming, past };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    if (activeFilter === "upcoming") {
      return registrations.filter((registration) =>
        isUpcoming(registration.event?.event_date)
      );
    }

    if (activeFilter === "past") {
      return registrations.filter(
        (registration) => !isUpcoming(registration.event?.event_date)
      );
    }

    return registrations;
  }, [registrations, activeFilter]);

  const topCardStyle = (type) => {
  const isActive = activeFilter === type;

  return {
    background: isActive ? "#eff6ff" : "white",
    borderRadius: "16px",
    padding: "22px",
    border: isActive ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    cursor: "pointer",
    transition: "0.2s ease",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: "6px"
  };
};

  if (!user) {
    return (
      <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px", color: "#0f172a" }}>
            My Events
          </h1>
          <p style={{ color: "#64748b" }}>Please login first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#0f172a",
            }}
          >
            My Events
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px" }}>
            Here you can see all events you have joined and manage your registrations.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div style={topCardStyle("all")} onClick={() => setActiveFilter("all")}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Total Events</p>
            <h2 style={{ margin: "8px 0 0", color: "#0f172a", fontSize: "28px" }}>
              {stats.total}
            </h2>
          </div>

          <div style={topCardStyle("upcoming")} onClick={() => setActiveFilter("upcoming")}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Upcoming</p>
            <h2 style={{ margin: "8px 0 0", color: "#2563eb", fontSize: "28px" }}>
              {stats.upcoming}
            </h2>
          </div>

          <div style={topCardStyle("past")} onClick={() => setActiveFilter("past")}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Past</p>
            <h2 style={{ margin: "8px 0 0", color: "#ef4444", fontSize: "28px" }}>
              {stats.past}
            </h2>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading...</p>
        ) : filteredRegistrations.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#64748b" }}>No registered events found.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {filteredRegistrations.map((registration) => {
              const event = registration.event;
              const upcoming = isUpcoming(event?.event_date);

              return (
                <div
                  key={registration.id}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "430px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={getEventImage(event)}
                      alt={event?.title || "Event"}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x220?text=No+Image";
                      }}
                      style={{
                        width: "100%",
                        height: "170px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 10px",
                        color: "#0f172a",
                        fontSize: "22px",
                        fontWeight: "700",
                        textAlign: "center",
                        minHeight: "56px",
                      }}
                    >
                      {event?.title || "Untitled Event"}
                    </h2>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: "1.6",
                        fontSize: "15px",
                        marginBottom: "16px",
                        textAlign: "center",
                        minHeight: "72px",
                      }}
                    >
                      {event?.description
                        ? event.description.length > 95
                          ? `${event.description.slice(0, 95)}...`
                          : event.description
                        : "No description available."}
                    </p>

                    <div
                      style={{
                        marginBottom: "18px",
                        fontSize: "15px",
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ margin: "0 0 8px" }}>
                        <strong>Date:</strong> {event?.event_date || "N/A"}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Location:</strong> {event?.location || "N/A"}
                      </p>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      <button
                        onClick={() => setCancelId(registration.id)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "none",
                          borderRadius: "12px",
                          background: "#ef4444",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "15px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {cancelId && (
  <div className="confirm-overlay">
    <div className="confirm-modal">
      <h3>Cancel registration?</h3>
      <p>Are you sure you want to cancel this registration?</p>

      <div className="confirm-actions">
        <button
          className="btn btn-light"
          onClick={() => setCancelId(null)}
        >
          No
        </button>

        <button
          className="btn btn-danger"
          onClick={handleCancelRegistration}
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default MyEvents;