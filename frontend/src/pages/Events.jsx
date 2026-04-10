import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: "",
    image: "",
  });
  const [userRegistrations, setUserRegistrations] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const placeholderImage =
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80";

  const getEventImage = (image) => {
    if (!image) return placeholderImage;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/storage/")) return `http://127.0.0.1:8000${image}`;
    if (image.startsWith("storage/")) return `http://127.0.0.1:8000/${image}`;
    return `http://127.0.0.1:8000/storage/${image}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
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
    fetchEvents();
    fetchUserRegistrations();
  }, []);

  const isRegistered = (eventId) => {
    return userRegistrations.some((registration) => registration.event_id === eventId);
  };

  const getParticipantsCount = (event) => {
  return event.users_count || 0;
};

  const getRemainingSpots = (event) => {
    return event.max_participants - getParticipantsCount(event);
  };

  const isEventFull = (event) => {
    return getRemainingSpots(event) <= 0;
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date ? event.event_date.slice(0, 16) : "",
      location: event.location || "",
      max_participants: event.max_participants || "",
      image: event.image || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/events/${editingEventId}`, {
        ...editForm,
        max_participants: Number(editForm.max_participants),
      });

      setEditingEventId(null);
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event.");
    }
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
  };

  const handleRegisterToEvent = async (eventId) => {
    try {
      if (!user) {
        alert("Please login first.");
        return;
      }

      await api.post("/register-event", {
        user_id: user.id,
        event_id: eventId,
      });

      alert("Registered successfully!");
      fetchEvents();
      fetchUserRegistrations();
    } catch (error) {
      console.error("Error registering to event:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed.");
      }
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-page">
      <div className="events-container">
        <div className="events-header">
          <div>
            <h1>All Events</h1>
            <p>Explore available events and join the ones that match your interests.</p>
          </div>

          <input
            type="text"
            placeholder="Search events..."
            className="events-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <img
                  src={getEventImage(event.image)}
                  alt={event.title}
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                  className="event-image"
                />

                <div className="event-card-body">
                  {editingEventId === event.id ? (
                    <form onSubmit={handleEditSubmit}>
                      <div className="edit-group">
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-group">
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          className="edit-input"
                          rows="4"
                          required
                        />
                      </div>

                      <div className="edit-group">
                        <input
                          type="datetime-local"
                          name="event_date"
                          value={editForm.event_date}
                          onChange={handleEditChange}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-group">
                        <input
                          type="text"
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-group">
                        <input
                          type="number"
                          name="max_participants"
                          value={editForm.max_participants}
                          onChange={handleEditChange}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-group">
                        <input
                          type="text"
                          name="image"
                          value={editForm.image}
                          onChange={handleEditChange}
                          className="edit-input"
                          placeholder="Image URL"
                        />
                      </div>

                      <div className="edit-actions">
                        <button type="submit" className="btn btn-primary">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn btn-light"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="event-title">{event.title}</h2>

                      <div className="event-meta-simple">
                        <p>
                          <strong>Date:</strong> {formatDate(event.event_date)}
                        </p>
                        <p>
                          <strong>Location:</strong> {event.location || "N/A"}
                        </p>
                      </div>

                      {user?.role === "admin" && (
                        <div className="event-actions-row event-actions-admin">
                          <button
                            onClick={() => handleEditClick(event)}
                            className="btn btn-primary"
                          >
                            Edit
                          </button>

                          <Link to={`/events/${event.id}`} className="btn btn-dark">
                            View Details
                          </Link>

                          <Link
                            to={`/events/${event.id}/participants`}
                            className="btn btn-secondary-dark"
                          >
                            Participants
                          </Link>

                          <button
                            onClick={() => handleDelete(event.id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {user?.role === "user" && (
  <div className="event-actions-row">
    <Link to={`/events/${event.id}`} className="btn btn-dark">
      View Details
    </Link>

    {isRegistered(event.id) ? (
      <button disabled className="btn btn-soft">
        Registered
      </button>
    ) : isEventFull(event) ? (
      <button disabled className="btn btn-disabled">
        Full
      </button>
    ) : (
      <button
        onClick={() => handleRegisterToEvent(event.id)}
        className="btn btn-primary"
      >
        Register
      </button>
    )}
  </div>
)}

                      {!user && (
                        <div className="event-actions-row">
                          <Link to={`/events/${event.id}`} className="btn btn-dark">
                            View Details
                          </Link>
                          <Link to="/login" className="btn btn-primary">
                            Login to Register
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;