import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./Events.css";
import { toast } from "react-toastify";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(""); 

  const placeholderImage =
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80";

  const getEventImage = (image) => {
    if (!image) return placeholderImage;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/storage/")) return `http://127.0.0.1:8000${image}`;
    if (image.startsWith("storage/")) return `http://127.0.0.1:8000/${image}`;
    return `http://127.0.0.1:8000/storage/${image}`;
  };

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      if (user?.role === "user") {
        const response = await api.get(`/users/${user.id}/registrations`);
        setUserRegistrations(response.data);
      }
    } catch (error) {
      console.error("Error fetching user registrations:", error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchUserRegistrations();
  }, [id]);

  const isRegistered = () => {
    return userRegistrations.some(
      (registration) => registration.event_id === Number(id)
    );
  };

  const getParticipantsCount = () => {
    return event?.users ? event.users.length : 0;
  };

  const getRemainingSpots = () => {
    return (event?.max_participants || 0) - getParticipantsCount();
  };

  const isEventFull = () => {
    return getRemainingSpots() <= 0;
  };

  const getEventStatus = () => {
    if (isEventFull()) return "Full";
    if (getRemainingSpots() <= 10) return "Almost Full";
    return "Open";
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegisterToEvent = async () => {
  try {
    if (!user) {
      toast.error("Please login first.");
      return;
    }

    await api.post("/register-event", {
      user_id: user.id,
      event_id: event.id,
    });

    toast.success("Registered successfully!");

    fetchEvent();
    fetchUserRegistrations();
  } catch (error) {
    console.error("Error registering to event:", error);

    toast.error(
      error.response?.data?.message || "Registration failed."
    );
  }
};

  if (loading) {
    return (
      <div className="event-details-page">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        <Link to="/events" className="back-link">
          ← Back to Events
        </Link>

        <div className="event-details-card">
          <img
            src={getEventImage(event.image)}
            alt={event.title}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
            className="event-details-image"
          />

          <div className="event-details-content">
            <h1>{event.title}</h1>

            {message && (
                 <div className={`custom-alert ${messageType}`}>
              {message}
              </div>
            )}
            <p className="event-details-description">
              {event.description || "No description available."}
            </p>

            <div className="event-details-info-grid">
              <div className="detail-box">
                <span>Date</span>
                <strong>{formatDateOnly(event.event_date)}</strong>
              </div>

              <div className="detail-box">
                <span>Time</span>
                <strong>{formatTimeOnly(event.event_date)}</strong>
              </div>

              <div className="detail-box">
                <span>Location</span>
                <strong>{event.location || "N/A"}</strong>
              </div>

              <div className="detail-box">
                <span>Capacity</span>
                <strong>{event.max_participants || 0} attendees</strong>
              </div>

              <div className="detail-box">
                <span>Spots Left</span>
                <strong>{Math.max(getRemainingSpots(), 0)}</strong>
              </div>

              <div className="detail-box">
                <span>Status</span>
                <strong>{getEventStatus()}</strong>
              </div>

              {event.creator?.name && (
                <div className="detail-box">
                  <span>Organizer</span>
                  <strong>{event.creator.name}</strong>
                </div>
              )}

              <div className="detail-box">
                <span>Participants</span>
                <strong>{getParticipantsCount()} registered</strong>
              </div>
            </div>

            <div className="event-extra-card">
              <h3>Event Overview</h3>
              <p>
                This event is scheduled for{" "}
                <strong>{formatDateOnly(event.event_date)}</strong> at{" "}
                <strong>{formatTimeOnly(event.event_date)}</strong> in{" "}
                <strong>{event.location || "N/A"}</strong>. Currently there are{" "}
                <strong>{Math.max(getRemainingSpots(), 0)}</strong> spots left
                out of <strong>{event.max_participants || 0}</strong>.
              </p>
            </div>

            {user?.role === "admin" && (
              <div className="event-details-actions bottom-actions">
                <Link
                  to={`/events/${event.id}/participants`}
                  className="btn btn-secondary-dark"
                >
                  View Participants
                </Link>
              </div>
            )}

            {user?.role === "user" && (
              <div className="event-details-actions bottom-actions">
                {isRegistered() ? (
                  <Link to="/my-events" className="btn btn-soft">
                             View in My Events <span>→</span>
                      </Link>
                ) : isEventFull() ? (
                  <button disabled className="btn btn-disabled">
                    Event Full
                  </button>
                ) : (
                  <button onClick={handleRegisterToEvent} className="btn btn-primary">
                    Register for This Event
                  </button>
                )}
              </div>
            )}

            {!user && (
              <div className="event-details-actions bottom-actions">
                <Link to="/login" className="btn btn-primary">
                  Login to Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;