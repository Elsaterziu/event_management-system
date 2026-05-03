import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./Participants.css";

function Participants() {
  const { eventId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [eventTitle, setEventTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [confirmRemove, setConfirmRemove] = useState({
    open: false,
    userId: null,
  });

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/events/${eventId}/participants`);

      setEventTitle(response.data.event || "Event Participants");
      setParticipants(response.data.participants || []);
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError("Failed to load participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const handleRemoveParticipant = async () => {
    if (!confirmRemove.userId) return;

    setMessage("");
    setError("");

    try {
      const response = await api.delete(
        `/events/${eventId}/remove-user/${confirmRemove.userId}`
      );

      setMessage(response.data?.message || "Participant removed successfully.");
      setConfirmRemove({ open: false, userId: null });
      fetchParticipants();
    } catch (err) {
      console.error("Error removing participant:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to remove participant."
      );
      setConfirmRemove({ open: false, userId: null });
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="participants-page">
        <div className="participants-denied">
          <h1>Access Denied</h1>
          <p>Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-page">
      <div className="participants-container">
         <div className="participants-header">

  <div className="summary-card">
    <span>Total Participants</span>
    <strong>{participants.length}</strong>
  </div>

  <div className="participants-header-text">
    <h1>Participants</h1>
    <h2>{eventTitle}</h2>

    {/* BACK KËTU POSHT */}
    <Link to="/admin" className="back-btn">
      Back
    </Link>
  </div>

  <div className="summary-card">
    <span>Event ID</span>
    <strong>{eventId}</strong>
  </div>

</div>
        {message && <div className="participants-alert success">{message}</div>}
        {error && <div className="participants-alert error">{error}</div>}

         {/* <div className="participants-summary">
          <div className="summary-card">
            <span>Total Participants</span>
            <strong>{participants.length}</strong>
          </div> 

          <div className="summary-card">
            <span>Event ID</span>
            <strong>{eventId}</strong>
          </div>
        </div> */}

        <div className="participants-card">
          {loading ? (
            <p className="participants-muted">Loading participants...</p>
          ) : participants.length === 0 ? (
            <div className="empty-state">
              <h3>No participants yet</h3>
              <p>No participants are registered for this event.</p>
            </div>
          ) : (
            <div className="participants-grid">
              {participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-top">
                    <div className="participant-avatar">
                      {participant.name ? participant.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <h3>{participant.name}</h3>
                      <p>{participant.email}</p>
                    </div>
                  </div>

                  <div className="participant-info">
                    <div>
                      <span>Name</span>
                      <strong>{participant.name}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{participant.email}</strong>
                    </div>

                    <div>
                      <span>User ID</span>
                      <strong>{participant.id}</strong>
                    </div>
                  </div>

                  <div className="participant-actions">
                    <button
                      type="button"
                      className="remove-participant-btn"
                      onClick={() =>
                        setConfirmRemove({ open: true, userId: participant.id })
                      }
                    >
                      Remove Participant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {confirmRemove.open && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <h3>Remove Participant</h3>
              <p>Are you sure you want to remove this participant from the event?</p>

              <div className="confirm-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setConfirmRemove({ open: false, userId: null })}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={handleRemoveParticipant}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Participants;